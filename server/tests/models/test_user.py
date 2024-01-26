"""
Unit tests for the User model.
"""

from datetime import datetime
from bson import ObjectId
import pytest
from mongoengine import connect, disconnect
from app.models.user import User, Assignment, Quiz
import mongomock
from mongoengine.errors import NotUniqueError


@pytest.fixture(scope="function")
def sample_user_data():
    """
    Fixture providing sample data for a user.
    """
    return {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "hubs": {"teacher": [ObjectId()], "student": [ObjectId()]},
        "assignments": [],
        "quizzes": [],
    }


@pytest.fixture(scope="function")
def setup_teardown(request):
    """
    Fixture to set up and tear down the test environment.
    """
    # Disconnect from any existing default connection
    disconnect(alias="default")

    # Connect to the test database with the default alias
    connect(
        "mongoenginetest",
        host="mongodb://localhost",
        alias="default",
        mongo_client_class=mongomock.MongoClient,
    )

    # Teardown: Drop the test database after the test
    def teardown():
        disconnect(alias="default")

    request.addfinalizer(teardown)


def test_create_user(sample_user_data, setup_teardown):
    """
    Test creating a user with the User model.
    """
    user = User(**sample_user_data)
    user.save()

    assert user.id is not None
    assert user.name == sample_user_data["name"]
    assert user.email == sample_user_data["email"]
    assert user.hubs == sample_user_data["hubs"]
    assert user.assignments == sample_user_data["assignments"]
    assert user.quizzes == sample_user_data["quizzes"]


def test_unique_email_constraint(sample_user_data, setup_teardown):
    """
    Test the unique email constraint in the User model.
    """
    # Create a user with a unique email
    user1 = User(**sample_user_data)
    user1.save()

    # Attempt to create another user with the same email
    user2_data = sample_user_data.copy()
    user2 = User(**user2_data)

    try:
        user2.save()
    except NotUniqueError as error:
        print(f"Caught exception: {error}")
        assert "keys" in str(error)
    else:
        # Raise AssertionError only if no exception was raised
        raise AssertionError("Expected NotUniqueError, but no exception was raised.")


def test_create_assignment_and_quiz(sample_user_data, setup_teardown):
    """
    Test creating an assignment and a quiz for a user.
    """
    # Create a user
    user = User(**sample_user_data)
    user.save()

    # Create an assignment and a quiz
    assignment = Assignment(assignment_id=ObjectId(), marks=50.5)
    quiz = Quiz(quiz_id=ObjectId(), marks=75.5, time_spent=datetime.utcnow())

    # Add the assignment and quiz to the user
    user.assignments.append(assignment)
    user.quizzes.append(quiz)
    user.save()

    assert len(user.assignments) == 1
    assert len(user.quizzes) == 1
    assert user.assignments[0].marks == 50.5
    assert user.quizzes[0].marks == 75.5
