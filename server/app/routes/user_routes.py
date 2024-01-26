"""
User routes for the Flask application.
"""

from flask import Blueprint, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.models.user import User

user_blueprint = Blueprint("user", __name__)


@user_blueprint.route("/api/user", methods=["POST"])
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
            return jsonify({"error": "Invalid data provided", "success": False}), 400

        new_user = User(
            name=data["name"],
            email=data["email"],
            hubs={},
            assignments=[],
            quizzes=[],
        )

        new_user.save()

        return jsonify({"message": "User created successfully", "success": True}), 201

    except Exception as error:
        return jsonify({"error": str(error), "success": False}), 500
