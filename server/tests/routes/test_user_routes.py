"""
Module for testing user routes in the app.
"""

import os
from unittest.mock import patch
import pytest
from app.enums import StatusCode
from app.routes.user_routes import user_blueprint
from app.models.user import User
from app.app import create_test_app
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


@pytest.mark.parametrize(
    "user_id, payload, expected_status, expected_response",
    [
        (
            "user_id_1",
            {"name": "John Doe", "email": "john7@example.com"},
            StatusCode.CREATED.value,
            {"message": "User created successfully", "success": True},
        ),
    ],
)
def test_create_user(
    client, mocker, user_id, payload, expected_status, expected_response
):
    """Test creating a user with valid data."""
    with app.test_request_context():
        response = client.post(
            "/api/sign-up",
            json=payload,
            headers={"user_id": user_id, "Bypass-Firebase": "true"},
        )

        print(response.get_json())

        assert response.status_code == expected_status
        assert response.json == expected_response

        User.objects(email=payload["email"]).delete()
        disconnect(alias="default")


@pytest.mark.parametrize(
    "user_id, payload, expected_status, expected_response",
    [
        (
            "user_id_1",
            {"email": "john@example.com"},
            StatusCode.BAD_REQUEST.value,
            {"error": "Invalid data provided", "success": False},
        ),
    ],
)
def test_create_user_invalid_data(
    client, mocker, user_id, payload, expected_status, expected_response
):
    """Test creating a user with invalid data."""

    with app.test_request_context(
        headers={"Bypass-Firebase": "true"},
        json=payload,
    ):
        response = client.post(
            "/api/sign-up",
            json=payload,
            headers={"Bypass-Firebase": "true"},
        )

    assert response.status_code == expected_status
    assert response.get_json() == expected_response


def test_create_user_exception(client):
    """Test creating a user with an exception in the save method."""
    user_data = {"name": "John Doe", "email": "john@example.com"}

    with app.test_request_context(
        headers={"Bypass-Firebase": "true"},
        json=user_data,
    ), patch("app.routes.user_routes.User.save") as mock_save:
        mock_save.side_effect = Exception("Mocked exception")

        response = client.post(
            "/api/sign-up",
            json=user_data,
            headers={"Bypass-Firebase": "true"},
        )

    print(response.get_json())

    assert response.status_code == StatusCode.INTERNAL_SERVER_ERROR.value
    assert response.get_json() == {"error": "Mocked exception", "success": False}


if __name__ == "__main__":
    pytest.main()
