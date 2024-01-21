from flask import Blueprint, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.models.user import User

user_blueprint = Blueprint("user", __name__)


@user_blueprint.route("/api/user", methods=["POST"])
@firebase_token_required
def create_user():
    try:
        data = request.get_json()

        if "name" not in data or "email" not in data:
            return jsonify({"error": "Invalid data provided", "success": False}), 400

        new_user = User(
            name=data["name"],
            email=data["email"],
            classes={},
            assignments=[],
            quizzes=[],
        )

        new_user.save()

        return jsonify({"message": "User created successfully", "success": True}), 201

    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500
