from bson import ObjectId
import pytest
from mongoengine import connect, disconnect
from app.models.user import User, Assignment, Quiz
from datetime import datetime
import mongomock
from mongoengine.errors import NotUniqueError


@pytest.fixture(scope="function")
def sample_user_data():
    return {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "student",
        "classes": {"teacher": [ObjectId()], "student": [ObjectId()]},
        "assignments": [],
        "quizzes": [],
    }


@pytest.fixture(scope="function")
def setup_teardown(request):
    # Connect to the test database
    connect('mongoenginetest', host='mongodb://localhost', mongo_client_class=mongomock.MongoClient)

    # Teardown: Drop the test database after the test
    def teardown():
        disconnect()

    request.addfinalizer(teardown)


def test_create_user(sample_user_data, setup_teardown):
    user = User(**sample_user_data)
    user.save()

    assert user.id is not None
    assert user.name == sample_user_data["name"]
    assert user.email == sample_user_data["email"]
    assert user.role == sample_user_data["role"]
    assert user.classes == sample_user_data["classes"]
    assert user.assignments == sample_user_data["assignments"]
    assert user.quizzes == sample_user_data["quizzes"]


def test_unique_email_constraint(sample_user_data, setup_teardown):
    # Create a user with a unique email
    user1 = User(**sample_user_data)
    user1.save()

    # Attempt to create another user with the same email
    user2_data = sample_user_data.copy() 
    user2 = User(**user2_data)

    try:
        user2.save()
    except NotUniqueError as e:
        print(f"Caught exception: {e}")
        assert "keys" in str(e)
    else:
        # Raise AssertionError only if no exception was raised
        raise AssertionError("Expected NotUniqueError, but no exception was raised.")


def test_create_assignment_and_quiz(sample_user_data, setup_teardown):
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
