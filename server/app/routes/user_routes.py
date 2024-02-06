"""
User routes for the Flask application.
"""

from flask import Blueprint, request, jsonify, current_app
from app.auth.firebase_auth import firebase_token_required
from app.enums import ErrorCode
from app.models.user import User
from app import redis

user_blueprint = Blueprint("user", __name__)


@user_blueprint.route("/api/sign-up", methods=["POST"])
@current_app.limiter.limit("5 per minute")
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
        user_id = request.current_user["user_id"]

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

        new_user.save()

        user_cache_key = f"user:{user_id}"

        user_object_id = new_user.id

        cache_data = {
            "user_id": str(user_object_id),
        }

        redis.hmset(user_cache_key, cache_data)

        return (
            jsonify({"message": "User created successfully", "success": True}),
            ErrorCode.CREATED.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            ErrorCode.INTERNAL_SERVER_ERROR.value,
        )
