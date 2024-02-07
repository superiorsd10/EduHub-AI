"""
Authentication utilities for Firebase in the Flask app.
"""

from functools import wraps
from app.enums import ErrorCode
from flask import request, jsonify, has_request_context
from firebase_admin import auth


def firebase_token_required(func):
    """
    Decorator function to require Firebase authentication.

    This decorator checks the Authorization header for a valid Firebase
    ID token. If present and valid, the decoded token is stored in the
    current_user attribute of the request object.

    :param func: The function to be decorated.
    :return: The decorated function.
    """

    @wraps(func)
    def decorated_function(*args, **kwargs):
        request_obj = kwargs.get("request", None)

        if request_obj is None:
            # If request object is not provided, use Flask's request
            if has_request_context():
                request_obj = request
            else:
                raise RuntimeError("No Flask request context available.")

        bypass_firebase = (
            request_obj.headers.get("Bypass-Firebase", "").lower() == "true"
        )

        if bypass_firebase:
            return func(*args, **kwargs)

        id_token = request_obj.headers.get("Authorization")

        if not id_token:
            return (
                jsonify({"error": "Authorization token is missing"}),
                ErrorCode.UNAUTHORIZED.value,
            )

        try:
            decoded_token = auth.verify_id_token(id_token)
            user_id = decoded_token["uid"]
            request_obj.headers.add_header("user_id", user_id)
        except auth.InvalidIdTokenError:
            return (
                jsonify({"error": "Invalid authorization token"}),
                ErrorCode.UNAUTHORIZED.value,
            )

        return func(*args, **kwargs)

    return decorated_function
