"""
Tests for user routes in the Flask application.
"""

import json
import unittest
from unittest.mock import patch, MagicMock
from app.enums import StatusCode
from app.routes.user_routes import user_blueprint
from app.app import create_test_app


class TestUserRoutes(unittest.TestCase):
    """
    Test class for user routes functionality.
    """

    def setUp(self):
        self.app = create_test_app()
        self.app.config["TESTING"] = True
        self.app.register_blueprint(user_blueprint)
        self.client = self.app.test_client()

    @patch("app.routes.user_routes.User")
    @patch("app.routes.user_routes.Config.redis_client", MagicMock())
    @patch("app.routes.user_routes.firebase_token_required", MagicMock())
    async def test_create_user_success(self, mock_user):
        """
        Tests successful user creation with valid data and bypasses Firebase auth.
        """

        with self.app.test_request_context():
            with patch("app.routes.user_routes.request") as mock_request:
                headers = {
                    "Bypass-Firebase": "true",
                }
                mock_request.headers = headers
                mock_request.get_json.return_value = {
                    "name": "Test User",
                    "email": "test@example.com",
                }
                mock_user_instance = mock_user.return_value
                mock_user_instance.id = "user_id"

                response = await self.client.post("/api/sign-up", headers=headers)

                data = json.loads(response.data.decode("utf-8"))

                self.assertEqual(response.status_code, StatusCode.CREATED.value)
                self.assertTrue(data["success"])
                self.assertEqual(data["message"], "User created successfully")


if __name__ == "__main__":
    unittest.main()
