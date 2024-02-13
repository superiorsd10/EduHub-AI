"""
Hub routes for the Flask application.
"""

import json
from datetime import datetime
import mongoengine
from flask import Blueprint, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.enums import ErrorCode
from app.models.hub import Hub
from app.models.user import User
from app.core import limiter
from config.config import Config
from marshmallow import Schema, fields, ValidationError
from bson.objectid import ObjectId

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


@hub_blueprint.route("/api/create-hub", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def create_hub():
    """
    Create a new hub.

    This route expects a JSON payload with 'hub_name', 'section', and 'description' fields.
    If the payload is valid and the user is authenticated with a valid Firebase token,
    it creates a new Hub associated with the user and returns a success message.

    Decorators:
    - @current_app.limiter.limit("5 per minute"): Limits the rate of requests to 5 per minute.
    - @firebase_token_required: Ensures that the request has a valid Firebase authentication token.

    :return: JSON response with success or error message.
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
                ErrorCode.BAD_REQUEST.value,
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
            created_at=datetime.now().replace(microsecond=0),
        )

        new_hub.save()

        new_hub_id = new_hub.id

        if "teacher" not in user.hubs:
            user.hubs["teacher"] = []

        user.hubs["teacher"].append(new_hub_id)
        user.save()

        redis_client.hset(user_cache_key, "hubs", json.dumps([], default=str))

        return (
            jsonify({"message": "Hub created successfully", "success": True}),
            ErrorCode.CREATED.value,
        )

    except ValidationError as error:
        return (
            jsonify({"error": error.messages, "success": False}),
            ErrorCode.BAD_REQUEST.value,
        )

    except mongoengine.errors.NotUniqueError:
        return (
            jsonify({"error": "Hub name already exists", "success": False}),
            ErrorCode.CONFLICT.value,
        )

    except mongoengine.errors.ValidationError as error:
        return (
            jsonify({"error": str(error), "success": False}),
            ErrorCode.BAD_REQUEST.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            ErrorCode.INTERNAL_SERVER_ERROR.value,
        )
