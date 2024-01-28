"""
Unit tests for the Quiz model.
"""

from datetime import datetime
from bson import ObjectId
import pytest
import mongomock
from app.models.quiz import Quiz, Question
from mongoengine import connect, disconnect


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


def test_question_model(setup_teardown):
    """
    Test Question model creation and attribute values.

    This test creates an instance of the Question model with specific data,
    verifies that the attributes are set correctly, and asserts the expected
    values.

    Args:
        setup_teardown: Fixture to set up and tear down the test environment.
    """
    # Test Question model creation and attribute values
    question_data = {
        "type": "single_correct",
        "image_url": "https://example.com/image.jpg",
        "text": "What is the capital of France?",
        "marks": 10,
        "options": ["Berlin", "Paris", "London"],
        "answers": "Paris",
    }

    question = Question(**question_data)
    assert question.type == question_data["type"]
    assert question.image_url == question_data["image_url"]
    assert question.text == question_data["text"]
    assert question.marks == question_data["marks"]
    assert question.options == question_data["options"]
    assert question.answers == question_data["answers"]


def test_quiz_model(setup_teardown):
    """
    Test Quiz model creation and attribute values.

    This test creates an instance of the Quiz model with specific data,
    saves it to the test database, retrieves it, and asserts that the
    retrieved quiz matches the original data.

    Args:
        setup_teardown: Fixture to set up and tear down the test environment.
    """
    # Test Quiz model creation and attribute values
    quiz_data = {
        "hub_id": ObjectId(),
        "title": "Geography Quiz",
        "description": "Test your knowledge of world geography.",
        "duration": datetime(2024, 1, 30, 12, 0, 0),
        "total_points": 100,
        "topic": "Geography",
        "created_at": datetime(2024, 1, 25, 8, 0, 0),
        "due_datetime": datetime(2024, 1, 28, 10, 0, 0),
        "questions": [
            {
                "type": "single_correct",
                "text": "What is the capital of France?",
                "marks": 10,
                "options": ["Berlin", "Paris", "London"],
                "answers": "Paris",
            },
        ],
    }

    quiz = Quiz(**quiz_data)
    quiz.save()

    # Retrieve the quiz from the test database
    retrieved_quiz = Quiz.objects.first()

    # Verify that the retrieved quiz matches the original data
    assert retrieved_quiz.hub_id == quiz_data["hub_id"]
    assert retrieved_quiz.title == quiz_data["title"]
    assert retrieved_quiz.description == quiz_data["description"]
    assert retrieved_quiz.duration == quiz_data["duration"]
    assert retrieved_quiz.total_points == quiz_data["total_points"]
    assert retrieved_quiz.topic == quiz_data["topic"]
    assert retrieved_quiz.created_at == quiz_data["created_at"]
    assert retrieved_quiz.due_datetime == quiz_data["due_datetime"]

    # Test questions in the quiz
    assert len(retrieved_quiz.questions) == len(quiz_data["questions"])
    for i, expected_question_data in enumerate(quiz_data["questions"]):
        expected_question = Question(**expected_question_data)
        retrieved_question = retrieved_quiz.questions[i]
        assert retrieved_question.type == expected_question.type
        assert retrieved_question.text == expected_question.text
        assert retrieved_question.marks == expected_question.marks
        assert retrieved_question.options == expected_question.options
        assert retrieved_question.answers == expected_question.answers


def test_question_model_additional(setup_teardown):
    """
    Test additional scenarios for the Question model.

    This test covers the creation of a Question model with a descriptive question,
    verifying that the attributes are set correctly, and asserting the expected values.

    Args:
        setup_teardown: Fixture to set up and tear down the test environment.
    """
    # Test Question model with a descriptive question
    descriptive_question_data = {
        "type": "descriptive",
        "text": "Explain the process of photosynthesis.",
        "marks": 15,
        "answers": "Photosynthesis is process by which green plants use sunlight to synthesize foo",
    }

    descriptive_question = Question(**descriptive_question_data)
    assert descriptive_question.type == descriptive_question_data["type"]
    assert descriptive_question.text == descriptive_question_data["text"]
    assert descriptive_question.marks == descriptive_question_data["marks"]
    assert descriptive_question.answers == descriptive_question_data["answers"]


def test_quiz_model_additional(setup_teardown):
    """
    Test additional scenarios for the Quiz model.

    This test covers scenarios such as creating a Quiz model without optional fields,
    creating a quiz with minimal data, and creating a quiz with multiple questions.
    It retrieves the created quizzes from the test database and asserts the expected values.

    Args:
        setup_teardown: Fixture to set up and tear down the test environment.
    """
    # Test Quiz model without optional fields
    minimal_quiz_data = {
        "hub_id": ObjectId(),
        "title": "Minimal Quiz",
        "questions": [
            {
                "type": "single_correct",
                "text": "What is 2 + 2?",
                "marks": 5,
                "options": ["3", "4", "5"],
                "answers": "4",
            },
        ],
    }

    minimal_quiz = Quiz(**minimal_quiz_data)
    minimal_quiz.save()

    # Retrieve the minimal quiz from the test database
    retrieved_minimal_quiz = Quiz.objects(title="Minimal Quiz").first()
    assert retrieved_minimal_quiz.hub_id == minimal_quiz_data["hub_id"]
    assert retrieved_minimal_quiz.title == minimal_quiz_data["title"]
    assert not retrieved_minimal_quiz.description
    assert not retrieved_minimal_quiz.duration
    assert not retrieved_minimal_quiz.total_points
    assert not retrieved_minimal_quiz.topic
    assert not retrieved_minimal_quiz.created_at
    assert not retrieved_minimal_quiz.due_datetime

    # Test a quiz with multiple questions
    multi_question_quiz_data = {
        "hub_id": ObjectId(),
        "title": "Multi-Question Quiz",
        "questions": [
            {
                "type": "single_correct",
                "text": "What is 2 + 2?",
                "marks": 5,
                "options": ["3", "4", "5"],
                "answers": "4",
            },
            {
                "type": "multi_correct",
                "text": "Select all prime numbers.",
                "marks": 10,
                "options": ["2", "4", "5", "7", "10"],
                "answers": "2,5,7",
            },
        ],
    }

    multi_question_quiz = Quiz(**multi_question_quiz_data)
    multi_question_quiz.save()

    # Retrieve the multi-question quiz from the test database
    retrieved_multi_question_quiz = Quiz.objects(title="Multi-Question Quiz").first()
    assert len(retrieved_multi_question_quiz.questions) == 2
    assert retrieved_multi_question_quiz.questions[0].type == "single_correct"
    assert retrieved_multi_question_quiz.questions[1].type == "multi_correct"
