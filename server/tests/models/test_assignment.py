"""
Unit tests for the Assignment model.
"""

from datetime import datetime
from bson import ObjectId
import pytest
import mongomock
from app.models.assignment import Assignment
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


def test_assignment_model(setup_teardown):
    """
    Test the Assignment model.

    This test covers creating an instance of the Assignment model,
    saving it to the test database, retrieving it, and performing various
    assertions to ensure the correct behavior.

    It also checks for the creation of indexes on hub_id and topic fields,
    and tests querying assignments by topic and hub_id.
    """
    # Create an assignment instance for testing
    assignment_data = {
        "hub_id": ObjectId(),
        "title": "Test Assignment",
        "difficulty": "medium",
        "instructions": "Follow the instructions carefully.",
        "attachments_url": "https://example.com/attachments",
        "total_points": 100,
        "due_datetime": datetime(2024, 1, 30, 12, 0, 0),
        "topic": "Testing",
        "scheduled_datetime": datetime(2024, 1, 28, 10, 0, 0),
        "created_at": datetime(2024, 1, 25, 8, 0, 0),
    }

    # Save the assignment to the test database
    test_assignment = Assignment(**assignment_data)
    test_assignment.save()

    # Retrieve the assignment from the test database
    retrieved_assignment = Assignment.objects.first()

    # Verify that the retrieved assignment matches the original data
    assert retrieved_assignment.hub_id == assignment_data["hub_id"]
    assert retrieved_assignment.title == assignment_data["title"]
    assert retrieved_assignment.difficulty == assignment_data["difficulty"]
    assert retrieved_assignment.instructions == assignment_data["instructions"]
    assert retrieved_assignment.attachments_url == assignment_data["attachments_url"]
    assert retrieved_assignment.total_points == assignment_data["total_points"]
    assert retrieved_assignment.due_datetime == assignment_data["due_datetime"]
    assert retrieved_assignment.topic == assignment_data["topic"]
    assert (
        retrieved_assignment.scheduled_datetime == assignment_data["scheduled_datetime"]
    )
    assert retrieved_assignment.created_at == assignment_data["created_at"]

    # Test if the index on hub_id is created
    index_info = Assignment.objects._collection.index_information()
    assert "hub_id_1" in index_info

    # Test if the index on topic is created
    assert "topic_1" in index_info

    # Test querying assignments by topic
    assignments_by_topic = Assignment.objects(topic=assignment_data["topic"])
    assert assignments_by_topic.count() == 1
    assert assignments_by_topic.first().topic == assignment_data["topic"]

    # Test querying assignments by hub_id
    assignments_by_hub_id = Assignment.objects(hub_id=assignment_data["hub_id"])
    assert assignments_by_hub_id.count() == 1
    assert assignments_by_hub_id.first().hub_id == assignment_data["hub_id"]
