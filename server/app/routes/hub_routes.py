"""
Hub routes for the Flask application.
"""

from datetime import datetime
from flask import Blueprint, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.enums import ErrorCode
from app.models.hub import Hub
from app.models.user import User
from app.core import limiter
from config.config import Config

hub_blueprint = Blueprint("hub", __name__)


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
        data = request.get_json()
        hub_name = data["hub_name"]
        section = data["section"]
        description = data["description"]
        email = data["email"]

        if "hub_name" not in data or "email" not in data:
            return (
                jsonify({"error": "Invalid data provided", "success": False}),
                ErrorCode.BAD_REQUEST.value,
            )

        user_cache_key = f"user:${email}"

        redis_client = Config.redis_client

        user_object_id = redis_client.hget(user_cache_key, "user_id")

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

        updated_count = User.objects(email=email).update_one(
            push__hubs__teacher=new_hub_id
        )

        if updated_count == 0:
            return (
                jsonify(
                    {
                        "error": "User not found or specified key does not exist",
                        "success": False,
                    }
                ),
                ErrorCode.NOT_FOUND.value,
            )

        return (
            jsonify({"message": "Hub created successfully", "success": True}),
            ErrorCode.CREATED.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            ErrorCode.INTERNAL_SERVER_ERROR.value,
        )
