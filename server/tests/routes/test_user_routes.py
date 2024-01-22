import os
import pytest
from app.routes.user_routes import user_blueprint
from app.models.user import User
from app import create_test_app
from unittest.mock import patch
from config.config import TestConfig
from dotenv import load_dotenv
from mongoengine import connect

load_dotenv()

app = create_test_app()
app.config.from_object(TestConfig)
app.config["TESTING"] = True
app.config["DEBUG"] = False


app.config["MONGODB_SETTINGS"] = {
    "db": os.environ.get("MONGO_TEST_DB"),
    "host": os.environ.get("MONGO_TEST_URI"),
    "username": os.environ.get("MONGO_USERNAME"),
    "password": os.environ.get("MONGO_PASSWORD"),
    "alias": "default",
}

mongo_config = app.config.get("MONGODB_SETTINGS")

try:
    connect(
        db=mongo_config["db"],
        host=mongo_config["host"],
        username=mongo_config["username"],
        password=mongo_config["password"],
        alias=mongo_config["alias"],
    )
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")

app.register_blueprint(user_blueprint)


@pytest.fixture
def client():
    return app.test_client()


def test_create_user_without_firebase_token_required(client):
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

    assert response.status_code == 201
    assert response.get_json() == {
        "message": "User created successfully",
        "success": True,
    }

    # Clean up: Delete the user from the database
    User.objects(email=user_data["email"]).delete()


def test_create_user_invalid_data(client):
    user_data = {"email": "john@example.com"}

    response = client.post(
        "/api/user",
        json=user_data,
        headers={"Bypass-Firebase": "true"},
    )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid data provided", "success": False}


def test_create_user_exception(client):
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

    assert response.status_code == 500
    assert response.get_json() == {"error": "Mocked exception", "success": False}


if __name__ == "__main__":
    pytest.main()
