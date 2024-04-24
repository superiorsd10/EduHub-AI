"""
User routes for the Flask application.
"""

import os
import stripe
from flask import Blueprint, request, jsonify, session
from app.auth.firebase_auth import firebase_token_required
from app.enums import StatusCode
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
                StatusCode.BAD_REQUEST.value,
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
        print(user_cache_key)

        if not redis_client.exists(user_cache_key):
            new_user.save()

            session["email"] = new_user.email

            user_object_id = new_user.id

            cache_data = {
                "user_object_id": str(user_object_id),
            }

            redis_client.hmset(user_cache_key, cache_data)

            return (
                jsonify({"message": "User created successfully", "success": True}),
                StatusCode.CREATED.value,
            )

        return (
            jsonify({"error": "User already exists", "success": False}),
            StatusCode.BAD_REQUEST.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@user_blueprint.route("/api/sign-in", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def sign_in():
    """
    Signs in and updates user's email in Flask's session.

    This route expects a JSON payload with 'email' field.
    If the payload is valid, it creates a new User and returns a success message.

    Decorators:
    - @firebase_token_required: Ensures that the request has a valid Firebase authentication token.

    :return: JSON response with success or error message.
    """
    try:
        data = request.get_json()

        if "email" not in data:
            return (
                jsonify({"error": "Invalid data provided", "success": False}),
                StatusCode.BAD_REQUEST.value,
            )

        redis_client = Config.redis_client

        user_cache_key = f"user:{data['email']}"

        if not redis_client.exists(user_cache_key):
            return (
                jsonify({"message": "User doesn't exist", "success": False}),
                StatusCode.BAD_REQUEST.value,
            )

        session["email"] = data["email"]

        return (
            jsonify({"error": "User already exists", "success": True}),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@user_blueprint.route("/api/log-out", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def log_out():
    """
    Logs out the user by removing their email from the session.

    This endpoint requires a POST request with a valid Firebase token in the Authorization header.

    Returns:
        A JSON response indicating the success or failure of the logout operation.

        If successful, the response contains:
        - "message": A success message indicating that the user has been logged out successfully.
        - "success": A boolean value indicating the success of the operation (True).

        If an error occurs, the response contains:
        - "error": A string describing the encountered error.
        - "success": A boolean value indicating the failure of the operation (False).

    Status Codes:
        - 200 OK: If the user is logged out successfully.
        - 429 Too Many Requests: If the rate limit is exceeded.
        - 500 Internal Server Error: If an unexpected error occurs during the logout process.
    """
    try:
        if "email" in session:
            session.pop("email")

        return (
            jsonify({"message": "Logged out successfully.", "success": True}),
            StatusCode.SUCCESS.value,
        )
    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@user_blueprint.route("/api/create-payment-intent", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def create_payment():
    """
    Create a new payment intent.

    This route expects a JSON payload with 'email' field.
    If the payload is valid, it creates a new payment id and returns a client_secret key.

    Decorators:
    - @firebase_token_required: Ensures that the request has a valid Firebase authentication token.

    :return: JSON response with client_secret key or error message.
    """
    try:
        print(request.get_json())
        email = request.get_json()["email"]
        stripe_keys = {
            "secret_key": os.environ["STRIPE_SECRET_KEY"],
            "publishable_key": os.environ["STRIPE_PUBLISHABLE_KEY"],
        }

        stripe.api_key = stripe_keys["secret_key"]
        intent = stripe.PaymentIntent.create(
            amount=500,
            currency="inr",
            automatic_payment_methods={
                "enabled": True,
            },
            receipt_email=email,
        )

        return (
            {
                "clientSecret": intent["client_secret"],
            },
            StatusCode.SUCCESS,
        )

    except Exception as error:
        return jsonify(error=str(error)), StatusCode.UNAUTHORIZED


# @user_blueprint.route('/api/activities/check-payment-intent', methods=['POST'])
# def check_payment():
#     stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
#     endpoint_secret = os.environ["STRIPE_ENDPOINT_KEY"]

#     event = None
#     payload = request.data
#     sig_header = request.headers['STRIPE_SIGNATURE']

#     try:
#         event = stripe.Webhook.construct_event(
#             payload, sig_header, endpoint_secret
#         )
#     except ValueError as e:
#         raise e
#     except stripe.error.SignatureVerificationError as e:
#         raise e

#     if event['type'] == 'payment_intent.succeeded':
#         payment_intent = event['data']['object']
#         user_uuid = payment_intent['metadata']['customer']
#         print(f"User {user_uuid} completed a payment.")

#     else:
#         print('Unhandled event type {}'.format(event['type']))

#     return jsonify(success=True)
