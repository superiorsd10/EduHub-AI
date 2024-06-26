"""
Hub routes for the Flask application.
"""

import json
import string
import secrets
import base64
from datetime import datetime
import mongoengine
from flask import Blueprint, current_app, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.enums import StatusCode
from app.models.hub import Hub
from app.models.user import User
from app.models.message import Message
from app.core import limiter
from marshmallow import Schema, fields, ValidationError
from bson.objectid import ObjectId
from redis import RedisError

hub_blueprint = Blueprint("hub", __name__)


class DateTimeEncoder(json.JSONEncoder):
    """
    Custom JSON encoder for serializing datetime objects to ISO 8601 format.

    This encoder extends the standard json.JSONEncoder class to provide support
    for serializing datetime objects to ISO 8601 format strings. When encoding
    datetime objects, it converts them to their corresponding ISO 8601 format
    strings using the obj.isoformat() method.

    Usage:
        Use this encoder to serialize datetime objects when converting Python
        objects to JSON strings.
    """

    def default(self, o):
        """
        Override the default method to serialize datetime objects.

        Args:
            obj (Any): The object to serialize.

        Returns:
            str: The JSON-serializable representation of the object.

        Raises:
            TypeError: If the object cannot be serialized.
        """
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)


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
    theme_color = fields.String(required=True)


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


def decode_base64_to_objectid(base64_encoded: str) -> ObjectId:
    """
    Decodes a base64 encoded string and converts it to an ObjectId.

    Args:
        base64_encoded (str): The base64 encoded string to decode.

    Returns:
        ObjectId: The decoded ObjectId.
    """
    decoded_bytes = base64.b64decode(base64_encoded)
    hex_string = decoded_bytes.decode("utf-8")
    object_id = ObjectId(hex_string)
    return object_id


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
        hub_name = data.get("hub_name")
        section = data.get("section")
        description = data.get("description")
        theme_color = data.get("theme_color")
        email = request.args.get("email")

        user_object_id_key = f"user_object_id_{email}"
        redis_client = current_app.redis_client
        user_object_id = redis_client.get(user_object_id_key)
        user_object_id = ObjectId(user_object_id.decode("utf-8"))

        user = User.objects(id=user_object_id).first()

        if not user:
            return (
                jsonify({"error": "User not found", "success": False}),
                StatusCode.BAD_REQUEST.value,
            )

        default_member_email = {
            "teacher": [email],
            "teaching_assistant": [],
            "student": [],
        }

        new_hub = Hub(
            name=hub_name,
            section=section,
            description=description,
            creator_id=user_object_id,
            theme_color=theme_color,
            members_email=default_member_email,
            invite_code=generate_invite_code(),
            created_at=datetime.now().replace(microsecond=0),
        )

        new_hub.save()

        new_hub_id = new_hub.id

        if len(user.hubs) != 0:
            user_hubs_key = f"user_hubs_{email}"
            redis_client.delete(user_hubs_key)

        if "teacher" not in user.hubs:
            user.hubs["teacher"] = []

        user.hubs["teacher"].append(new_hub_id)
        user.save()

        user_hub_object_id_role_key = f"user_{email}_hub_object_id_{new_hub_id}_role"
        redis_client.set(user_hub_object_id_role_key, "teacher")

        return (
            jsonify({"hub_id": str(new_hub_id)}),
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
# @limiter.limit("5 per minute")
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
        email = request.args.get("email")

        redis_client = current_app.redis_client
        user_hubs_key = f"user_hubs_{email}"
        cached_hubs_data = redis_client.get(user_hubs_key)

        if cached_hubs_data:
            return (
                jsonify({"data": json.loads(cached_hubs_data), "success": True}),
                StatusCode.SUCCESS.value,
            )

        user_object_id_key = f"user_object_id_{email}"
        user_object_id = redis_client.get(user_object_id_key)

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

        redis_client.set(user_hubs_key, json.dumps(results, default=str))

        return (
            jsonify({"data": json.loads(results), "success": True}),
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
# @limiter.limit("5 per minute")
# @firebase_token_required
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
        email = request.args.get("email")
        redis_client = current_app.redis_client

        hub_id = decode_base64_to_objectid(str(hub_id))

        if not ObjectId.is_valid(hub_id):
            return (
                jsonify({"error": "Invalid hub ID", "success": False}),
                StatusCode.BAD_REQUEST,
            )

        user_hub_object_id_role_key = f"user_{email}_hub_object_id_{hub_id}_role"
        role = redis_client.get(user_hub_object_id_role_key)
        role = role.decode("utf-8")
        page = request.args.get("page", 1, type=int)

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
                            "introductory": json.loads(cached_introductory_data),
                            "paginated": json.loads(cached_paginated_data),
                            "role": role,
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
                            "paginated": json.loads(cached_paginated_data),
                            "role": role,
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

        paginated_data = b"[]"

        if result:
            paginated_data = json.dumps(result, cls=DateTimeEncoder)
            redis_client.set(cache_paginated_key, paginated_data)

        if page == 1:
            introductory_data = {}

            if cached_introductory_data:
                introductory_data = cached_introductory_data
            else:
                introductory_data = Hub.objects(id=hub_id).first()
                introductory_data = introductory_data.to_mongo().to_dict()
                introductory_data["_id"] = str(introductory_data.get("_id"))

                introductory_final_data = {
                    "_id": str(introductory_data.get("_id")),
                    "name": introductory_data.get("name"),
                    "section": introductory_data.get("section"),
                    "description": introductory_data.get("description"),
                    "topics": introductory_data.get("topics"),
                    "theme_color": introductory_data.get("theme_color"),
                    "photo_url": introductory_data.get("photo_url"),
                    "invite_code": introductory_data.get("invite_code"),
                }

                introductory_data = json.dumps(
                    introductory_final_data,
                    cls=DateTimeEncoder,
                )

                redis_client.set(
                    cache_introductory_key,
                    introductory_data,
                )

            return (
                jsonify(
                    {
                        "data": {
                            "introductory": json.loads(introductory_data),
                            "paginated": json.loads(paginated_data),
                            "role": role,
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
                        "paginated": json.loads(paginated_data),
                        "role": role,
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
            jsonify({"error": f"Hub not found: {error}", "success": False}),
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


@hub_blueprint.route("/api/<hub_id>/get-topics", methods=["GET"])
@limiter.limit("5 per minute")
@firebase_token_required
def get_topics(hub_id):
    """
    Fetches the topics associated with a hub.

    This endpoint retrieves the topics associated with a hub identified by the provided hub ID.
    It first checks if the topics data is available in the Redis cache.
    If found, it returns the cached data.
    If not found in the cache, it queries the database for the topics,
    caches the result in Redis, and returns it.

    Args:
        hub_id (str): The base64-encoded ID of the hub whose topics are to be fetched.

    Returns:
        flask.Response: A JSON response containing the topics data.
            If successful, the response contains the topics data and a success message.
            If the hub or topics data is not found, the response contains
            an error message and a failure status code.

    """
    try:
        hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)

        redis_client = current_app.redis_client
        hub_topics_key = f"hub_topics_hub_id_{hub_object_id}"
        topics_data = redis_client.get(hub_topics_key)

        if topics_data:
            return (
                jsonify({"message": jsonify(topics_data), "success": True}),
                StatusCode.SUCCESS.value,
            )

        topics = Hub.objects(id=hub_object_id).first()

        if topics:
            topics_data = topics.to_mongo().to_dict()
            topics_data = topics_data.get("topics")
            json_topics_data = json.dumps(topics_data)
            redis_client.set(hub_topics_key, json_topics_data)
            return (
                jsonify({"message": topics_data, "success": True}),
                StatusCode.SUCCESS.value,
            )

        return (
            jsonify({"error": "Recording not found", "success": False}),
            StatusCode.NOT_FOUND.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@hub_blueprint.route("/api/<hub_id>/get-invitation-list", methods=["GET"])
@limiter.limit("5 per minute")
@firebase_token_required
def get_invitation_list(hub_id):
    """Retrieve the invitation list for a hub.

    Args:
        hub_id (str): The base64 encoded ID of the hub.

    Returns:
        tuple: A tuple containing a JSON response with the invitation list and success status code.

    Raises:
        Exception: If an error occurs while retrieving the invitation list.
    """
    try:
        hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)

        redis_client = current_app.redis_client
        hub_invitation_list_key = f"hub_{hub_object_id}_invitation_list"
        hub_invitation_list = redis_client.zrange(
            hub_invitation_list_key, 0, -1, withscores=False
        )
        hub_invitation_list_decoded = [
            item.decode("utf-8") for item in hub_invitation_list
        ]

        return (
            jsonify({"message": hub_invitation_list_decoded, "success": True}),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@hub_blueprint.route("/api/messages/<hub_id>", methods=["GET"])
@limiter.limit("5 per minute")
@firebase_token_required
def get_messages(hub_id):
    """
    Retrieve messages from a hub.

    Args:
        hub_id (str): The base64-encoded ObjectId of the hub.

    Query Parameters:
        limit (int): Limit the number of messages to retrieve. Default is 50.
        skip (int): Number of messages to skip. Default is 0.
        created_at (str, optional): Retrieve messages created before this timestamp.

    Returns:
        tuple: A tuple containing a JSON response with retrieved messages and a success flag.

    Raises:
        Exception: If an error occurs during message retrieval.

    Note:
        This endpoint requires Firebase authentication token.
    """

    try:
        limit = int(request.args.get("limit", 50))
        skip = int(request.args.get("skip", 0))
        created_at = request.args.get("created_at")

        hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)

        if created_at:
            messages = (
                Message.objects(hub_id=hub_object_id, created_at__lt=created_at)
                .order_by("-created_at")
                .limit(limit)
                .skip(skip)
            )
        else:
            messages = (
                Message.objects(hub_id=hub_object_id)
                .order_by("-created_at")
                .limit(limit)
                .skip(skip)
            )

        return (
            jsonify(
                {
                    "message": [message.to_mongo() for message in messages],
                    "success": True,
                }
            ),
            StatusCode.SUCCESS.value,
        )
    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )
