"""
Unit tests for the Hub model.
"""

from datetime import datetime, timedelta
from bson import ObjectId
import pytest
import mongomock
from app.models.hub import Hub, Recording, Quiz, Assignment, Post, Message
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


def test_create_hub(setup_teardown):
    """
    Test creating a Hub instance and saving it to the test database.

    This test covers the basic creation of a Hub instance with required fields,
    saving it to the test database, and retrieving it for verification.
    """
    hub_data = {
        "name": "TestHub",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
    }

    # Create a Hub instance
    test_hub = Hub(**hub_data)
    test_hub.save()

    # Retrieve the hub from the test database
    retrieved_hub = Hub.objects.first()

    # Verify that the retrieved hub matches the original data
    assert retrieved_hub.name == hub_data["name"]
    assert retrieved_hub.creator_id == hub_data["creator_id"]
    assert retrieved_hub.members_id == hub_data["members_id"]
    assert retrieved_hub.auth_option == hub_data["auth_option"]
    assert retrieved_hub.created_at == hub_data["created_at"]


def test_hub_with_recordings_quizzes_assignments(setup_teardown):
    """
    Test creating a Hub with recordings, quizzes, and assignments.

    This test covers creating a Hub with recordings, quizzes, and assignments,
    saving it to the test database, and verifying the data consistency.
    """
    hub_data = {
        "name": "TestHubWithContent",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "recordings": [
            Recording(url="https://example.com/recording1", summary="Summary 1"),
            Recording(url="https://example.com/recording2", summary="Summary 2"),
        ],
        "quizzes": [
            Quiz(
                quiz_id=ObjectId(),
                title="Quiz 1",
                total_points=20,
                topic="Science",
                due_datetime=datetime(2024, 2, 1, 12, 0, 0),
            ),
            Quiz(
                quiz_id=ObjectId(),
                title="Quiz 2",
                total_points=15,
                topic="Math",
                due_datetime=datetime(2024, 2, 5, 12, 0, 0),
            ),
        ],
        "assignments": [
            Assignment(
                assignment_id=ObjectId(),
                title="Assignment 1",
                total_points=30,
                topic="History",
                due_datetime=datetime(2024, 2, 10, 12, 0, 0),
            ),
        ],
    }

    # Create a Hub instance with recordings, quizzes, and assignments
    test_hub = Hub(**hub_data)
    test_hub.save()

    # Retrieve the hub from the test database
    retrieved_hub = Hub.objects(name="TestHubWithContent").first()

    # Verify that the retrieved hub matches the original data
    assert retrieved_hub.name == hub_data["name"]
    assert retrieved_hub.creator_id == hub_data["creator_id"]
    assert retrieved_hub.members_id == hub_data["members_id"]
    assert retrieved_hub.auth_option == hub_data["auth_option"]
    assert retrieved_hub.created_at == hub_data["created_at"]

    # Verify recordings
    assert len(retrieved_hub.recordings) == 2
    assert retrieved_hub.recordings[0].url == "https://example.com/recording1"
    assert retrieved_hub.recordings[1].summary == "Summary 2"

    # Verify quizzes
    assert len(retrieved_hub.quizzes) == 2
    assert retrieved_hub.quizzes[0].title == "Quiz 1"
    assert retrieved_hub.quizzes[1].total_points == 15

    # Verify assignments
    assert len(retrieved_hub.assignments) == 1
    assert retrieved_hub.assignments[0].due_datetime == datetime(2024, 2, 10, 12, 0, 0)


def test_hub_with_posts_messages(setup_teardown):
    """
    Test creating a Hub with posts and messages.

    This test covers creating a Hub with posts and messages,
    saving it to the test database, and verifying the data consistency.
    """
    hub_data = {
        "name": "HubWithPostsMessages",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "posts": [
            Post(
                type="announcement",
                title="Important Announcement",
                description="This is a crucial announcement.",
                attachments_url="https://example.com/attachment",
                attachments_type=["pdf"],
                topic="General",
                created_at=datetime(2024, 2, 15, 10, 0, 0),
                poll_options=["Option A", "Option B", "Option C"],
                emoji_reactions={"thumbs_up": 3, "heart": 1},
            ),
            Post(
                type="material",
                title="Study Material",
                description="Attached is the study material for the upcoming quiz.",
                attachments_url="https://example.com/study_material",
                attachments_type=["docx"],
                topic="Science",
                created_at=datetime(2024, 2, 16, 12, 0, 0),
            ),
        ],
        "messages": [
            Message(
                sender_id=ObjectId(),
                content="Hello, this is a test message!",
                timestamp=datetime(2024, 2, 17, 8, 0, 0),
                emoji_reactions={"thumbs_up": 3, "clap": 1},
            ),
            Message(
                sender_id=ObjectId(),
                content="Another message for testing.",
                timestamp=datetime(2024, 2, 17, 9, 0, 0),
            ),
        ],
    }

    # Create a Hub instance with posts and messages
    test_hub = Hub(**hub_data)
    test_hub.save()

    # Retrieve the hub from the test database
    retrieved_hub = Hub.objects(name="HubWithPostsMessages").first()

    # Verify that the retrieved hub matches the original data
    assert retrieved_hub.name == hub_data["name"]
    assert retrieved_hub.creator_id == hub_data["creator_id"]
    assert retrieved_hub.members_id == hub_data["members_id"]
    assert retrieved_hub.auth_option == hub_data["auth_option"]
    assert retrieved_hub.created_at == hub_data["created_at"]

    # Verify posts
    assert len(retrieved_hub.posts) == 2
    assert retrieved_hub.posts[0].type == "announcement"
    assert (
        retrieved_hub.posts[1].attachments_url == "https://example.com/study_material"
    )

    # Verify messages
    assert len(retrieved_hub.messages) == 2
    assert retrieved_hub.messages[0].content == "Hello, this is a test message!"
    assert "clap" in retrieved_hub.messages[0].emoji_reactions


def test_hub_with_duplicate_streaming_url(setup_teardown):
    """
    Test creating a Hub with a duplicate streaming URL.

    This test covers creating a Hub with a duplicate streaming URL,
    attempting to save it to the test database, and handling the uniqueness constraint.
    """
    hub_data1 = {
        "name": "HubWithStreaming1",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "streaming_url": "https://example.com/streaming1",
    }

    hub_data2 = {
        "name": "HubWithStreaming2",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "streaming_url": "https://example.com/streaming1",  # Same streaming URL as hub_data1
    }

    # Create and save the first Hub with a streaming URL
    test_hub1 = Hub(**hub_data1)
    test_hub1.save()

    # Attempt to create and save the second Hub with the same streaming URL
    with pytest.raises(Exception):
        test_hub2 = Hub(**hub_data2)
        test_hub2.save()


def test_hub_theme_color_and_photo_url(setup_teardown):
    """
    Test creating a Hub with theme color and photo URL.

    This test covers creating a Hub with a theme color and photo URL,
    saving it to the test database, and verifying the data consistency.
    """
    hub_data = {
        "name": "HubWithThemeAndPhoto",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "theme_color": "#336699",
        "photo_url": "https://example.com/hub_photo.jpg",
    }

    # Create a Hub instance with a theme color and photo URL
    test_hub = Hub(**hub_data)
    test_hub.save()

    # Retrieve the hub from the test database
    retrieved_hub = Hub.objects(name="HubWithThemeAndPhoto").first()

    # Verify that the retrieved hub matches the original data
    assert retrieved_hub.name == hub_data["name"]
    assert retrieved_hub.creator_id == hub_data["creator_id"]
    assert retrieved_hub.members_id == hub_data["members_id"]
    assert retrieved_hub.auth_option == hub_data["auth_option"]
    assert retrieved_hub.created_at == hub_data["created_at"]
    assert retrieved_hub.theme_color == hub_data["theme_color"]
    assert retrieved_hub.photo_url == hub_data["photo_url"]


def test_hub_with_invalid_recordings(setup_teardown):
    """
    Test creating a Hub with invalid recording data.

    This test covers creating a Hub with recordings missing required attributes,
    attempting to save it to the test database, and handling validation errors.
    """
    hub_data = {
        "name": "HubWithInvalidRecordings",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId(), ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "recordings": [
            Recording(
                url="https://example.com/recording1"
            ),  # Missing 'summary' attribute
            Recording(summary="Recording 2 summary."),  # Missing 'url' attribute
        ],
    }

    # Attempt to create and save the Hub with invalid recording data
    with pytest.raises(Exception):
        test_hub = Hub(**hub_data)
        test_hub.save()


def test_hub_with_messages_and_reactions(setup_teardown):
    """
    Test creating a Hub with messages and emoji reactions.

    This test covers creating a Hub with messages and emoji reactions,
    saving it to the test database, and verifying the data consistency.
    """
    hub_data = {
        "name": "HubWithMessagesAndReactions",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId(), ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "messages": [
            Message(
                sender_id=ObjectId(),
                content="Hello, everyone!",
                timestamp=datetime(2024, 2, 20, 14, 30, 0),
                emoji_reactions={"thumbs_up": 3, "heart": 1},
            ),
            Message(
                sender_id=ObjectId(),
                content="Meeting at 3 PM today.",
                timestamp=datetime(2024, 2, 21, 10, 0, 0),
                emoji_reactions={"thumbs_up": 1, "clap": 2},
            ),
        ],
    }

    # Create a Hub instance with messages and emoji reactions
    test_hub = Hub(**hub_data)
    test_hub.save()

    # Retrieve the hub from the test database
    retrieved_hub = Hub.objects(name="HubWithMessagesAndReactions").first()

    # Verify that the retrieved hub matches the original data
    assert retrieved_hub.name == hub_data["name"]
    assert retrieved_hub.creator_id == hub_data["creator_id"]
    assert retrieved_hub.members_id == hub_data["members_id"]
    assert retrieved_hub.auth_option == hub_data["auth_option"]
    assert retrieved_hub.created_at == hub_data["created_at"]

    # Verify messages
    assert len(retrieved_hub.messages) == 2
    assert retrieved_hub.messages[0].content == "Hello, everyone!"
    assert retrieved_hub.messages[1].emoji_reactions == {"thumbs_up": 1, "clap": 2}


def test_hub_with_duplicate_institute_id(setup_teardown):
    """
    Test creating a Hub with a duplicate institute_id.

    This test covers creating a Hub with a duplicate institute_id,
    attempting to save it to the test database, and handling the uniqueness constraint.
    """
    hub_data1 = {
        "name": "HubWithInstituteID1",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "institute_id": "institute123",
    }

    hub_data2 = {
        "name": "HubWithInstituteID2",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "institute_id": "institute123",  # Duplicate institute_id
    }

    # Create and save the first Hub with an institute_id
    test_hub1 = Hub(**hub_data1)
    test_hub1.save()

    # Attempt to create and save the second Hub with the same institute_id
    with pytest.raises(Exception):
        test_hub2 = Hub(**hub_data2)
        test_hub2.save()


def test_hub_with_empty_name(setup_teardown):
    """
    Test creating a Hub with an empty name.

    This test covers attempting to create a Hub with an empty name,
    attempting to save it to the test database, and handling the validation error.
    """
    hub_data = {
        "name": "",  # Empty name
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId(), ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
    }

    # Attempt to create and save the Hub with an empty name
    with pytest.raises(Exception):
        test_hub = Hub(**hub_data)
        test_hub.save()


def test_hub_with_invalid_auth_option(setup_teardown):
    """
    Test creating a Hub with an invalid auth_option.

    This test covers attempting to create a Hub with an invalid auth_option,
    attempting to save it to the test database, and handling the validation error.
    """
    hub_data = {
        "name": "HubWithInvalidAuthOption",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId(), ObjectId()]},
        "auth_option": "invalid_option",  # Invalid auth_option
        "created_at": datetime.now().replace(microsecond=0),
    }

    # Attempt to create and save the Hub with an invalid auth_option
    with pytest.raises(Exception):
        test_hub = Hub(**hub_data)
        test_hub.save()


def test_hub_with_invalid_url_formats(setup_teardown):
    """
    Test creating a Hub with invalid URL formats.

    This test covers attempting to create a Hub with invalid URL formats for streaming URL
    and photo URL, attempting to save it to the test database, and handling the validation error.
    """
    hub_data = {
        "name": "HubWithInvalidURLFormats",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "streaming_url": "invalid_url",  # Invalid streaming URL format
        "photo_url": "ftp://invalid_url",  # Invalid photo URL format
    }

    # Attempt to create and save the Hub with invalid URL formats
    with pytest.raises(Exception):
        test_hub = Hub(**hub_data)
        test_hub.save()


def test_hub_with_large_data(setup_teardown):
    """
    Test creating a Hub with a large number of recordings, quizzes, assignments, posts, or messages.

    This test covers creating a Hub with a large amount of data,
    attempting to save it to the test database, and assessing performance.
    """
    # Generate a large amount of data for recordings, quizzes, assignments, posts, or messages
    large_data = {
        "recordings": [
            Recording(url=f"https://recording{i}.com", summary=f"Summary {i}")
            for i in range(100)
        ],
        "quizzes": [Quiz(title=f"Quiz {i}", quiz_id=ObjectId()) for i in range(50)],
        "assignments": [
            Assignment(title=f"Assignment {i}", assignment_id=ObjectId())
            for i in range(50)
        ],
        "posts": [Post(title=f"Post {i}", type="material") for i in range(100)],
        "messages": [
            Message(
                content=f"Message {i}", sender_id=ObjectId(), timestamp=datetime.now()
            )
            for i in range(100)
        ],
    }

    hub_data = {
        "name": "HubWithLargeData",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        **large_data,
    }

    # Attempt to create and save the Hub with large data
    test_hub = Hub(**hub_data)
    test_hub.save()


def test_hub_without_mandatory_fields(setup_teardown):
    """
    Test creating a Hub without providing values for mandatory fields.

    This test covers attempting to create a Hub without values for mandatory fields,
    attempting to save it to the test database, and handling the validation error.
    """
    hub_data = {
        # Omitting mandatory fields (e.g., creator_id, name)
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
    }

    # Attempt to create and save the Hub without mandatory fields
    with pytest.raises(Exception):
        test_hub = Hub(**hub_data)
        test_hub.save()


def test_hub_with_invalid_quiz_data(setup_teardown):
    """
    Test creating a Hub with invalid quiz data.

    This test covers creating a Hub with quiz data that has missing or invalid attributes,
    attempting to save it to the test database, and handling the validation error.
    """
    invalid_quiz_data = {
        "quizzes": [
            Quiz(title="Invalid Quiz 1"),  # Missing type, marks, and answers
            Quiz(title="Invalid Quiz 2"),  # Missing text
        ],
    }

    hub_data = {
        "name": "HubWithInvalidQuizData",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        **invalid_quiz_data,
    }

    # Attempt to create and save the Hub with invalid quiz data
    with pytest.raises(Exception):
        test_hub = Hub(**hub_data)
        test_hub.save()


def test_hub_with_expired_quiz_or_assignment(setup_teardown):
    """
    Test creating a Hub with quizzes or assignments that have due_datetime in the past.

    This test covers creating a Hub with quizzes or assignments that have due_datetime in the past,
    attempting to save it to the test database, and handling the validation error.
    """
    expired_due_datetime = datetime.now() - timedelta(days=1)

    hub_data = {
        "name": "HubWithExpiredQuizAssignment",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "quizzes": [
            Quiz(title="Expired Quiz", due_datetime=expired_due_datetime),
        ],
        "assignments": [
            Assignment(title="Expired Assignment", due_datetime=expired_due_datetime),
        ],
    }

    # Attempt to create and save the Hub with expired quizzes or assignments
    with pytest.raises(Exception):
        test_hub = Hub(**hub_data)
        test_hub.save()


def test_hub_with_long_strings(setup_teardown):
    """
    Test creating a Hub with very long strings for attributes like name, description,
    or post content.
    This test covers creating a Hub with very long strings for attributes like name,
    description,
    or post content, attempting to save it to the test database, and handling the validation error.
    """
    long_string = "A" * 1000  # Create a string with 1000 characters

    hub_data = {
        "name": long_string,  # Long name
        "description": long_string,  # Long description
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
    }

    # Attempt to create and save the Hub with very long strings
    with pytest.raises(Exception):
        test_hub = Hub(**hub_data)
        test_hub.save()


def test_hub_with_specific_theme_color(setup_teardown):
    """
    Test creating a Hub with a specific theme color and ensuring that it reflects correctly.

    This test covers creating a Hub with a specific theme color,
    retrieving it from the test database, and ensuring that the theme color reflects correctly.
    """
    theme_color = "#00FF00"  # Specific theme color

    hub_data = {
        "name": "HubWithSpecificThemeColor",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "theme_color": theme_color,
    }

    # Create and save the Hub with a specific theme color
    test_hub = Hub(**hub_data)
    test_hub.save()

    # Retrieve the Hub from the test database
    retrieved_hub = Hub.objects(name="HubWithSpecificThemeColor").first()

    # Verify that the retrieved Hub has the correct theme color
    assert retrieved_hub.theme_color == theme_color


def test_hub_with_specific_streaming_url(setup_teardown):
    """
    Test creating a Hub with a specific streaming URL and ensuring that it reflects correctly.

    This test covers creating a Hub with a specific streaming URL,
    retrieving it from the test database, and ensuring that the streaming URL reflects correctly.
    """
    streaming_url = "https://streaming.example.com"

    hub_data = {
        "name": "HubWithSpecificStreamingURL",
        "creator_id": ObjectId(),
        "members_id": {"admins": [ObjectId()], "members": [ObjectId()]},
        "auth_option": "open_to_anyone",
        "created_at": datetime.now().replace(microsecond=0),
        "streaming_url": streaming_url,
    }

    # Create and save the Hub with a specific streaming URL
    test_hub = Hub(**hub_data)
    test_hub.save()

    # Retrieve the Hub from the test database
    retrieved_hub = Hub.objects(name="HubWithSpecificStreamingURL").first()

    # Verify that the retrieved Hub has the correct streaming URL
    assert retrieved_hub.streaming_url == streaming_url
