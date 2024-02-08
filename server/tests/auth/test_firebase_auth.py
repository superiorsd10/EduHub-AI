"""
Unit tests for Firebase authentication decorator.
"""

import pytest

from app.app import create_app
from app.auth.firebase_auth import firebase_token_required
from app.enums import ErrorCode
from flask import jsonify
from config.config import Config

app = create_app(Config)
app.config["TESTING"] = True
app.config["DEBUG"] = False


def test_decorator_invalid_token():
    """
    Test the behavior of the firebase_token_required decorator with an invalid token.
    """

    # Create a mock request object with an invalid token
    mock_request = type(
        "Request", (object,), {"headers": {"Authorization": "invalid_token"}}
    )()

    with app.app_context():
        # Define a simple function decorated with the firebase_token_required decorator
        @firebase_token_required
        def protected_route(request=None):
            return jsonify({"message": "You have access!"}), ErrorCode.SUCCESS.value

        # Call the decorated function with the mock request object
        response, status_code = protected_route(request=mock_request)

        # Assert the behavior or result of the decorator
        assert response.get_json() == {"error": "Invalid authorization token"}
        assert status_code == ErrorCode.UNAUTHORIZED.value


def test_decorator_missing_token():
    """
    Test the behavior of the firebase_token_required decorator with a missing token.
    """
    # Create a mock request object without a token
    mock_request = type("Request", (object,), {"headers": {}})()

    with app.app_context():
        # Define a simple function decorated with the firebase_token_required decorator
        @firebase_token_required
        def protected_route(request=None):
            return jsonify({"message": "You have access!"}), ErrorCode.SUCCESS.value

        # Call the decorated function with the mock request object
        response, status_code = protected_route(request=mock_request)

        # Assert the behavior or result of the decorator
        assert response.get_json() == {"error": "Authorization token is missing"}
        assert status_code == ErrorCode.UNAUTHORIZED.value


if __name__ == "__main__":
    pytest.main()
