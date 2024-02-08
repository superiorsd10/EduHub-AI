"""
User routes for the Flask application.
"""

from flask import Blueprint, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.enums import ErrorCode
from app.models.user import User
from app.core import limiter
from config.config import Config

user_blueprint = Blueprint("user", __name__)


@user_blueprint.route("/api/sign-up", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def create_user():
    """
    Create a new user.

    This route expects a JSON payload with 'name' and 'email' fields.
    If the payload is valid, it creates a new User and returns a success message.

    Decorators:
    - @firebase_token_required: Ensures that the request has a valid Firebase authentication token.

    :return: JSON response with success or error message.
    """
    try:
        data = request.get_json()

        if "name" not in data or "email" not in data:
            return (
                jsonify({"error": "Invalid data provided", "success": False}),
                ErrorCode.BAD_REQUEST.value,
            )

        new_user = User(
            name=data["name"],
            email=data["email"],
            hubs={},
            assignments=[],
            quizzes=[],
        )

        redis_client = Config.redis_client

        user_cache_key = f"user:{data['email']}"

        if not redis_client.exists(user_cache_key):
            new_user.save()

        user_object_id = new_user.id

        cache_data = {
            "user_object_id": str(user_object_id),
        }

        redis_client.hmset(user_cache_key, cache_data)

        return (
            jsonify({"message": "User created successfully", "success": True}),
            ErrorCode.CREATED.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            ErrorCode.INTERNAL_SERVER_ERROR.value,
        )
