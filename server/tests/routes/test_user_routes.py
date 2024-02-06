"""
Module for testing user routes in the app.
"""

import os
from unittest.mock import patch
import pytest
from app.enums import ErrorCode
from app.routes.user_routes import user_blueprint
from app.models.user import User
from app import create_test_app
from config.config import TestConfig
from dotenv import load_dotenv
from mongoengine import connect, disconnect

load_dotenv()

app = create_test_app()
app.config.from_object(TestConfig)
app.config["TESTING"] = True
app.config["DEBUG"] = False


app.config["MONGODB_SETTINGS"] = {
    # type: ignore
    "db": os.environ.get("MONGO_TEST_DB"),
    "host": os.environ.get("MONGO_TEST_URI"),
    "username": os.environ.get("MONGO_USERNAME"),
    "password": os.environ.get("MONGO_PASSWORD"),
    "alias": "default",
}

mongo_config = app.config.get("MONGODB_SETTINGS")

app.register_blueprint(user_blueprint)


@pytest.fixture
def client():
    """Fixture for creating a test client."""
    return app.test_client()


@pytest.fixture(scope="session", autouse=True)
def setup_teardown(request):
    """Fixture for setting up and tearing down the test environment."""
    disconnect(alias="default")

    try:
        connect(
            db=mongo_config["db"],
            host=mongo_config["host"],
            username=mongo_config["username"],
            password=mongo_config["password"],
            alias=mongo_config["alias"],
        )
        print("Connected to MongoDB successfully!")
    except Exception as exception:
        print(f"Failed to connect to MongoDB: {exception}")

    # Teardown: Drop the test database after the test
    def teardown():
        """Teardown function to disconnect from MongoDB."""
        disconnect(alias="default")

    request.addfinalizer(teardown)


def test_create_user_without_firebase_token_required(client):
    """Test creating a user without a Firebase token (happy path)."""
    user_data = {"name": "John Doe", "email": "john@example.com"}

    with app.app_context():
        with app.test_request_context(
            headers={"Bypass-Firebase": "true"},
            json=user_data,
        ):
            response = client.post(
                "/api/user",
                json=user_data,
                headers={"Bypass-Firebase": "true"},
            )

            print(response.get_json())

    assert response.status_code == ErrorCode.CREATED.value
    assert response.get_json() == {
        "message": "User created successfully",
        "success": True,
    }

    # Clean up: Delete the user from the database
    User.objects(email=user_data["email"]).delete()

    # Explicitly disconnect from the MongoDB connection
    disconnect(alias="default")


def test_create_user_invalid_data(client):
    """Test creating a user with invalid data."""
    user_data = {"email": "john@example.com"}

    response = client.post(
        "/api/user",
        json=user_data,
        headers={"Bypass-Firebase": "true"},
    )

    assert response.status_code == ErrorCode.BAD_REQUEST.value
    assert response.get_json() == {"error": "Invalid data provided", "success": False}


def test_create_user_exception(client):
    """Test creating a user with an exception in the save method."""
    user_data = {"name": "John Doe", "email": "john@example.com"}

    with app.test_request_context(
        headers={"Bypass-Firebase": "true"},
        json=user_data,
    ), patch("app.routes.user_routes.User.save") as mock_save:
        mock_save.side_effect = Exception("Mocked exception")

        response = client.post(
            "/api/user",
            json=user_data,
            headers={"Bypass-Firebase": "true"},
        )

    print(response.get_json())

    assert response.status_code == ErrorCode.INTERNAL_SERVER_ERROR.value
    assert response.get_json() == {"error": "Mocked exception", "success": False}


if __name__ == "__main__":
    pytest.main()
