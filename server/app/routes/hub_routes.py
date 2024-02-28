"""
Hub routes for the Flask application.
"""

import json
import string
import secrets
from datetime import datetime
import mongoengine
from flask import Blueprint, request, jsonify, session
from app.auth.firebase_auth import firebase_token_required
from app.enums import StatusCode
from app.models.hub import Hub
from app.models.user import User
from app.core import limiter
from config.config import Config
from marshmallow import Schema, fields, ValidationError
from bson.objectid import ObjectId
from app.encryption import CryptoUtils
from redis import RedisError
from flask_socketio import join_room
from app.app import socketio

hub_blueprint = Blueprint("hub", __name__)


class CreateHubSchema(Schema):
    """
    Marshmallow schema for validating and sanitizing data for creating a new hub.

    This schema defines the following fields:

    - `hub_name`: Required string representing the name of the hub.
    - `section`: Optional string representing the section the hub belongs to.
    - `description`: Optional string describing the hub.
    - `email`: Required email address of the user creating the hub.

    Raises:
        ValidationError: If any field fails validation.

    Returns:
        dict: Validated and sanitized data dictionary.
    """

    hub_name = fields.String(required=True)
    section = fields.String()
    description = fields.String()
    email = fields.Email(required=True)


class JoinHubSchema(Schema):
    """
    Marshmallow schema for validating and sanitizing data for joining a hub.

    This schema defines a single field:

    - `email` (required, str): The email address of the user joining the hub.

    Raises:

    - ValidationError: if the email address is invalid.

    Returns:

    - dict: A validated and sanitized dictionary containing the user's email.
    """

    email = fields.Email(required=True)


def generate_invite_code():
    """
    Generates a random, 7-character alphanumeric invite code.

    This function uses the Python `secrets` module to generate a cryptographically
    secure random string of 7 characters from the combined set of uppercase and
    lowercase letters (a-z, A-Z) and digits (0-9).

    Returns:
        str: A randomly generated 7-character alphanumeric invite code.
    """
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(7))


@hub_blueprint.route("/api/create-hub", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def create_hub():
    """
    Creates a new hub for a user.

    This endpoint creates a new Hub object in the database based on the provided data.
    It performs validation, checks for existing hubs with the same name, and handles
    various potential errors.

    **Request:**

    - **Method:** POST
    - **URL:** /api/create-hub
    - **Body:** JSON data with the following fields:
        - `hub_name`: The name of the hub (required, string)
        - `section`: The section this hub belongs to (optional, string)
        - `description`: A description of the hub (optional, string)
        - `email`: The email address of the user creating the hub (required, string)

    **Response:**

    - **Success:**
        - JSON response with:
            - `message`: "Hub created successfully"
            - `success`: True
        - Status code: 201 Created
    - **Error:**
        - JSON response with:
            - `error`: Error message describing the issue
            - `success`: False
        - Status code varies depending on the error (e.g., 400 for bad request,
          409 for conflict, 500 for internal server error)

    **Raises:**

    - `ValidationError`: If the request data is invalid.
    - `NotUniqueError`: If a hub with the same name already exists.
    - `Exception`: For any other unexpected error.

    **Notes:**

    - Requires a valid Firebase authentication token.
    - Rate-limited to 5 requests per minute per user.
    - Generates an invite code and streaming URL for the new hub.
    """
    try:
        schema = CreateHubSchema()
        data = schema.load(request.get_json())

        hub_name = data["hub_name"]
        section = data["section"]
        description = data["description"]
        email = data["email"]

        user_cache_key = f"user:{email}"
        redis_client = Config.redis_client
        user_object_id = redis_client.hget(user_cache_key, "user_object_id")
        user_object_id = ObjectId(user_object_id.decode("utf-8"))

        user = User.objects(id=user_object_id).first()

        if not user:
            return (
                jsonify({"error": "User not found", "success": False}),
                StatusCode.BAD_REQUEST.value,
            )

        default_member_id = {
            "teacher": [user_object_id],
            "teaching_assistant": [],
            "student": [],
        }

        new_hub = Hub(
            name=hub_name,
            section=section,
            description=description,
            creator_id=user_object_id,
            members_id=default_member_id,
            invite_code=generate_invite_code(),
            streaming_url=f"https://localhost:3000/{generate_invite_code()}",
            created_at=datetime.now().replace(microsecond=0),
        )

        new_hub.save()

        new_hub_id = new_hub.id

        if "teacher" not in user.hubs:
            user.hubs["teacher"] = []

        user.hubs["teacher"].append(new_hub_id)
        user.save()

        redis_client.hset(user_cache_key, "hubs", json.dumps(["empty"], default=str))

        return (
            jsonify({"message": "Hub created successfully", "success": True}),
            StatusCode.CREATED.value,
        )

    except ValidationError as error:
        return (
            jsonify({"error": error.messages, "success": False}),
            StatusCode.BAD_REQUEST.value,
        )

    except mongoengine.errors.NotUniqueError as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.CONFLICT.value,
        )

    except mongoengine.errors.ValidationError as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.BAD_REQUEST.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@hub_blueprint.route("/api/get-hubs", methods=["GET"])
@limiter.limit("5 per minute")
@firebase_token_required
def get_hubs():
    """
    Retrieves a user's associated hubs.

    This endpoint retrieves the hubs associated with a user based on their email address.

    It first checks for cached data in Redis, and if not found,
    queries the database using MongoDB aggregation pipelines.

    The fetched data is then cached in Redis for future requests.

    **Request:**

    - **Method:** GET
    - **URL:** /api/get-hubs

    **Response:**

    - Success:
        - JSON response with the following structure:
            - `data`: List of dictionaries containing hub information (name,
            photo_url, creator_name)
            - `success`: True
        - Status code: 200 OK
    - Error:
        - JSON response with the following structure:
            - `error`: Error message string
            - `success`: False
        - Status code depends on the error type (e.g., 400 for bad request, 500 for
        internal server error)

    **Additional notes:**

    - Requires a valid Firebase authentication token.
    - Rate-limited to 5 requests per minute per user.
    - Uses Redis caching for performance optimization.
    """
    try:
        email = session.get("email")

        redis_client = Config.redis_client
        user_cache_key = f"user:{email}"
        cached_hubs_data = redis_client.hget(user_cache_key, "hubs")

        if cached_hubs_data and cached_hubs_data != b'["empty"]':
            return (
                jsonify({"data": json.loads(cached_hubs_data), "success": True}),
                StatusCode.SUCCESS.value,
            )

        user_object_id = redis_client.hget(user_cache_key, "user_object_id")
        if not user_object_id:
            return (
                jsonify({"error": "User not found in cache", "success": False}),
                StatusCode.BAD_REQUEST.value,
            )

        try:
            user_object_id = ObjectId(user_object_id.decode("utf-8"))
        except Exception as error:
            return (
                jsonify(
                    {"error": f"Invalid user object ID: {error}", "success": False}
                ),
                StatusCode.BAD_REQUEST.value,
            )

        user = User.objects(id=user_object_id).first()

        if not user:
            return (
                jsonify({"error": "User not found", "success": False}),
                StatusCode.BAD_REQUEST.value,
            )

        pipeline = [
            {"$match": {"_id": user_object_id}},
            {
                "$lookup": {
                    "from": "hubs",
                    "localField": "hubs.teacher",
                    "foreignField": "_id",
                    "as": "teacher_hubs",
                }
            },
            {
                "$lookup": {
                    "from": "hubs",
                    "localField": "hubs.student",
                    "foreignField": "_id",
                    "as": "student_hubs",
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "teacher_hubs.creator_id",
                    "foreignField": "_id",
                    "as": "teacher_creators",
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "student_hubs.creator_id",
                    "foreignField": "_id",
                    "as": "student_creators",
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "teacher": {
                        "$map": {
                            "input": "$teacher_hubs",
                            "as": "teacher_hub",
                            "in": {
                                "hub_id": "$$teacher_hub._id",
                                "name": "$$teacher_hub.name",
                                "theme_color": "$$teacher_hub.theme_color",
                                "creator_name": {
                                    "$arrayElemAt": ["$teacher_creators.name", 0]
                                },
                            },
                        }
                    },
                    "student": {
                        "$map": {
                            "input": "$student_hubs",
                            "as": "student_hub",
                            "in": {
                                "hub_id": "$$student_hub._id",
                                "name": "$$student_hub.name",
                                "theme_color": "$$student_hub.theme_color",
                                "creator_name": {
                                    "$arrayElemAt": ["$student_creators.name", 0]
                                },
                            },
                        }
                    },
                }
            },
        ]

        try:
            results = User.objects.aggregate(pipeline)
            results = list(results)
        except Exception as error:
            return (
                jsonify(
                    {"error": f"Error fetching user or hubs: {error}", "success": False}
                ),
                StatusCode.INTERNAL_SERVER_ERROR.value,
            )

        redis_client.hset(user_cache_key, "hubs", json.dumps(results, default=str))

        return (
            jsonify({"data": results, "success": True}),
            StatusCode.SUCCESS.value,
        )

    except ValidationError as error:
        return (
            jsonify({"error": error.messages, "success": False}),
            StatusCode.BAD_REQUEST.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@hub_blueprint.route("/api/hub/<hub_id>", methods=["GET"])
@limiter.limit("5 per minute")
@firebase_token_required
def get_hub(hub_id):
    """
    Retrieves hub data including introductory information and paginated content.

    This endpoint retrieves data for a specific hub based on the provided hub ID.

    It first attempts to decrypt the encrypted hub ID using CryptoUtils.
    If decryption fails, it returns a BadRequest error.
    Then, it checks the validity of the hub ID. If the ID is invalid, it returns a BadRequest error.

    The function supports pagination and retrieves paginated content for
    the hub based on the specified page number.

    Cached data is first checked in Redis, and if found,
    it is returned directly to the client.
    If cached data is not available, the function constructs a MongoDB
    aggregation pipeline to fetch paginated content from the database.
    The paginated content is then stored in Redis for caching.

    If the page number is 1, additional introductory data for
    the hub is fetched from the database and also stored in
    Redis for caching.
    The response includes both introductory and paginated data
    if the page number is 1, otherwise only paginated data is returned.

    The function is rate-limited to 5 requests per minute per user and
    requires a valid Firebase authentication token for access.

    It handles various error scenarios including decryption errors,
    invalid hub ID, database errors, and Redis errors,
    and returns appropriate error responses with relevant error messages.

    **Request:**
    - Method: GET
    - URL: /api/hub/<hub_id>

    **Response:**
    - Success:
        - JSON response with the following structure:
            - data: Dictionary containing introductory and paginated data
            - success: True
        - Status code: 200 OK
    - Error:
        - JSON response with the following structure:
            - error: Error message string
            - success: False
        - Status code depends on the error type (e.g., 400 for bad request,
        500 for internal server error)

    **Additional notes:**
    - Requires a valid Firebase authentication token.
    - Rate-limited to 5 requests per minute per user.
    - Uses Redis caching for performance optimization.
    """

    try:
        try:
            crypto_utils = CryptoUtils()
            hub_id = crypto_utils.decrypt_object_id(hub_id)
        except (RuntimeError, ValueError) as error:
            return (
                jsonify(
                    {"error": "Failed to decrypt hub ID" + str(error), "success": False}
                ),
                StatusCode.BAD_REQUEST,
            )

        if not ObjectId.is_valid(hub_id):
            return (
                jsonify({"error": "Invalid hub ID", "success": False}),
                StatusCode.BAD_REQUEST,
            )

        page = request.args.get("page", 1, type=int)

        redis_client = Config.redis_client

        cache_paginated_key = f"hub_{hub_id}_paginated_page_{page}"
        cache_introductory_key = f"hub_{hub_id}_introductory"

        cached_data = redis_client.mget(cache_paginated_key, cache_introductory_key)

        cached_paginated_data = cached_data[0]
        cached_introductory_data = cached_data[1]

        if cached_introductory_data and cached_paginated_data:
            return (
                jsonify(
                    {
                        "data": {
                            "introductory": cached_introductory_data,
                            "paginated": cached_paginated_data,
                        },
                        "success": True,
                    }
                ),
                StatusCode.SUCCESS.value,
            )

        if cached_paginated_data:
            return (
                jsonify(
                    {
                        "data": {
                            "paginated": cached_paginated_data,
                        },
                        "success": True,
                    }
                ),
                StatusCode.SUCCESS.value,
            )

        page_size = 10

        pipeline = [
            {"$match": {"_id": hub_id}},
            {
                "$project": {
                    "_id": 0,
                    "items": {
                        "$concatArrays": [
                            "$recordings",
                            "$quizzes",
                            "$assignments",
                            "$posts",
                        ]
                    },
                }
            },
            {"$unwind": "$items"},
            {"$sort": {"items.created_at": -1}},
            {"$skip": (page - 1) * page_size},
            {"$limit": page_size},
        ]

        result = list(Hub.objects.aggregate(pipeline))

        paginated_data = [item["items"].to_json() for item in result]

        redis_client.set(cache_paginated_key, jsonify(paginated_data))

        if page == 1:
            introductory_data = {}

            if cached_introductory_data:
                introductory_data = cached_introductory_data
            else:
                introductory_data = (
                    Hub.objects(id=hub_id)
                    .only(
                        "name",
                        "section",
                        "description",
                        "theme_color",
                        "photo_url",
                        "invite_code",
                        "streaming_url",
                    )
                    .first()
                    .to_mongo()
                    .to_dict()
                )

                redis_client.set(
                    cache_introductory_key,
                    jsonify(cache_introductory_key),
                )

            return (
                jsonify(
                    {
                        "data": {
                            "introductory": introductory_data,
                            "paginated": paginated_data,
                        },
                        "success": True,
                    }
                ),
                StatusCode.SUCCESS.value,
            )

        return (
            jsonify(
                {
                    "data": {
                        "paginated": paginated_data,
                    },
                    "success": True,
                }
            ),
            StatusCode.SUCCESS.value,
        )

    except ValidationError as error:
        return (
            jsonify({"error": error.messages, "success": False}),
            StatusCode.BAD_REQUEST,
        )
    except mongoengine.errors.DoesNotExist as error:
        return (
            jsonify({"error": "Hub not found", "success": False}),
            StatusCode.NOT_FOUND,
        )
    except RedisError as error:
        return (
            jsonify({"error": "Redis error: " + str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@hub_blueprint.route("/api/join-hub/<invite_code>", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def join_hub(invite_code):
    """
    Joins a user to a hub.

    This endpoint allows a user to join a hub based on the provided invite code.
    It checks if the hub exists, validates the request data, and sends a join request
    notification to the hub creator.

    **Request:**

    - **Method:** POST
    - **URL:** /api/join-hub/<invite_code>
    - **Body:** JSON data with the following fields:
        - `email`: The email address of the user joining the hub (required, string)

    **Response:**

    - **Success:**
        - JSON response with:
            - `message`: "Join request sent successfully"
            - `success`: True
        - Status code: 200 OK
    - **Error:**
        - JSON response with:
            - `error`: Error message describing the issue
            - `success`: False
        - Status code varies depending on the error (e.g., 404 for not found,
          409 for conflict, 500 for internal server error)

    **Raises:**

    - `ValidationError`: If the request data is invalid.
    - `Exception`: For any other unexpected error.

    **Notes:**

    - Requires a valid Firebase authentication token.
    - Rate-limited to 5 requests per minute per user.
    - Sends a join request notification to the hub creator if the hub is found and the
      user is not already a member.
    """

    try:
        schema = JoinHubSchema()
        data = schema.load(request.get_json())
        email = data["email"]

        hub_data = (
            Hub.objects(invite_code=invite_code)
            .only("creator_id", "members_id")
            .first()
        )

        if hub_data is None:
            return (
                jsonify(
                    {
                        "error": "Hub not found for the provided invite code",
                        "success": False,
                    }
                ),
                StatusCode.NOT_FOUND.value,
            )

        hub_data_dict = hub_data.to_mongo().to_dict()

        hub_id = hub_data.id
        creator_id = hub_data_dict.get("creator_id")
        members_id = hub_data_dict.get("members_id")

        redis_client = Config.redis_client
        user_cache_key = f"user:{email}"
        user_object_id = redis_client.hget(user_cache_key, "user_object_id")
        user_object_id = ObjectId(user_object_id.decode("utf-8"))

        is_member_already_exists = any(
            user_object_id in id_list for id_list in members_id.values()
        )

        if is_member_already_exists:
            return (
                jsonify({"error": "Member already exists", "success": False}),
                StatusCode.CONFLICT.value,
            )

        room_id = f"{str(creator_id)}-{str(user_object_id)}"
        join_room(room_id)
        socketio.emit(
            "join_request_notification",
            {"user_id": user_object_id, "hub_id": hub_id},
            room=room_id,
        )

        return (
            jsonify({"message": "Join request sent successfully", "success": True}),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )
