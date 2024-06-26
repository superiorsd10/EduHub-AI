"""
User routes for the Flask application.
"""

import os
import stripe
from flask import Blueprint, current_app, request, jsonify, session
from app.auth.firebase_auth import firebase_token_required
from app.enums import StatusCode
from app.models.user import User
from app.core import limiter
from marshmallow import Schema, fields

user_blueprint = Blueprint("user", __name__)


class SignUpSchema(Schema):
    """
    Schema for signing up a new user.

    Attributes:
        name (str): The name of the user. Required field.
        email (str): The email address of the user. Required field.
    """

    name = fields.String(required=True)
    email = fields.String(required=True)


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
        schema = SignUpSchema()
        data = schema.load(request.get_json())

        name = data.get("name")
        email = data.get("email")

        new_user = User(
            name=name,
            email=email,
            hubs={},
            assignments={},
            quizzes={},
        )

        redis_client = current_app.redis_client
        user_object_id_key = f"user_object_id_{email}"
        user_name_key = f"user_name_{email}"

        if not redis_client.exists(user_object_id_key):
            new_user.save()
            user_object_id = new_user.id
            redis_client.set(user_object_id_key, str(user_object_id))
            redis_client.set(user_name_key, name)

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
        email = request.args.get("email")

        if not email:
            return (
                jsonify({"error": "Provide email", "success": False}),
                StatusCode.BAD_REQUEST.value,
            )

        redis_client = current_app.redis_client
        user_object_id_key = f"user_object_id_{email}"

        if not redis_client.exists(user_object_id_key):
            return (
                jsonify({"message": "User doesn't exist", "success": False}),
                StatusCode.BAD_REQUEST.value,
            )

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
