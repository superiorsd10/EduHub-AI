"""
Hub routes for the Flask application.
"""

from flask import Blueprint, request, jsonify
from app import redis
from app.auth.firebase_auth import firebase_token_required
from app.enums import ErrorCode
from app.models.hub import Hub
from app.core import limiter

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
        user_id = request.current_user["user_id"]

        data = request.get_json()
        hub_name = data["hub_name"]
        section = data["section"]
        description = data["description"]

        if not hub_name:
            return (
                jsonify({"error": "Hub name is required", "success": False}),
                ErrorCode.BAD_REQUEST.value,
            )

        user_cache_key = f"user:{user_id}"

        user_object_id = redis.hget(user_cache_key, "user_id")

        new_hub = Hub(
            name=hub_name,
            section=section,
            description=description,
            creator_id=user_object_id,
        )

        new_hub.save()

        return (
            jsonify({"message": "Hub created successfully", "success": True}),
            ErrorCode.CREATED.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            ErrorCode.INTERNAL_SERVER_ERROR.value,
        )
