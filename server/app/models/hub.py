"""
Module containing the Hub model for the application.
"""

from datetime import datetime
from mongoengine import (
    Document,
    StringField,
    ObjectIdField,
    ListField,
    DictField,
    EmbeddedDocumentField,
    EmbeddedDocument,
    URLField,
    IntField,
    DateTimeField,
    MapField,
)

from mongoengine.base import BaseField


class SetField(BaseField):
    """
    A custom field to represent a set that allows duplicate values during insertion."""

    def __init__(self, field=None, **kwargs):
        """
        Initializes the field
        """
        self.field = field or ListField(field=str)
        super().__init__(**kwargs)

    def to_python(self, value):
        """
        Converts the value to a Python set during retrieval.
        """
        if value is None:
            return set()
        return set(value)

    def to_mongo(self, value):
        """
        Converts the value to a list during storage.
        """
        if not isinstance(value, (set, list, tuple)):
            self.error("Value must be a set, list, or tuple.")
        return list(value)

    def validate(self, value):
        """
        Performs validation on the value.
        """
        if not isinstance(value, (set, list, tuple)):
            self.error("Value must be a set, list, or tuple.")


class Recording(EmbeddedDocument):
    """
    Represents a recording of a conversation or event within a room.

    Attributes:
        uuid (str): The universally unique identifier (UUID) of the recording.
        title (str): The title or name of the recording.
        description (str, optional): A brief description or summary of the recording.
        topic (str, optional): The topic or subject matter associated with the recording.
        room_id (str): The unique identifier of the room where the recording took place.
        created_at (datetime): The date and time when the recording was created.
    """

    uuid = StringField()
    title = StringField(required=True)
    description = StringField()
    topic = StringField()
    room_id = StringField(required=True)
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))


class Quiz(EmbeddedDocument):
    """
    Represents a quiz in the Hub.

    Attributes:
    - quiz_id: ObjectIdField, required
    - title: StringField, required
    - total_points: IntField
    - topic: StringField
    - due_datetime: DateTimeField
    """

    quiz_id = ObjectIdField(required=True)
    title = StringField(required=True)
    total_points = IntField()
    topic = StringField()
    due_datetime = DateTimeField()
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))


class Assignment(EmbeddedDocument):
    """
    Represents an assignment in the Hub.

    Attributes:
    - assignment_id: ObjectIdField, required
    - title: StringField, required
    - total_points: IntField
    - topic: StringField
    - due_datetime: DateTimeField
    """

    assignment_id = ObjectIdField(required=True)
    title = StringField(required=True)
    total_points = IntField()
    topic = StringField()
    due_datetime = DateTimeField()
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))


class Post(EmbeddedDocument):
    """
    Represents a post in the Hub.

    Attributes:
    - type: StringField, choices=("announcement", "material"), required
    - title: StringField, required
    - description: StringField
    - attachments_url: URLField
    - attachments_type: ListField(StringField())
    - topic: StringField
    - created_at: DateTimeField
    - poll_options: ListField(StringField())
    - emoji_reactions: DictField(field=StringField())

    Meta:
    - collection: "posts"
    - indexes: [
        {"fields": ["topic"]},
        {"fields": ["type"]},
    ]
    """

    uuid = StringField()
    type = StringField(choices=("announcement", "material"), required=True)
    title = StringField(required=True)
    description = StringField()
    attachments_url = ListField(URLField())
    attachments_type = ListField(StringField())
    topic = StringField()
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))
    poll_options = ListField(StringField())
    emoji_reactions = DictField(field=IntField())

    meta = {
        "collection": "posts",
        "indexes": [
            {"fields": ["topic"]},
            {"fields": ["type"]},
        ],
    }


class Message(EmbeddedDocument):
    """
    Represents a message in the Hub.

    Attributes:
    - sender_id: ObjectIdField, required
    - content: StringField, required
    - timestamp: DateTimeField, required
    - emoji_reactions: DictField(field=StringField())
    """

    sender_id = ObjectIdField(required=True)
    content = StringField(required=True)
    timestamp = DateTimeField(required=True)
    emoji_reactions = DictField(field=IntField())


class Hub(Document):
    """
    Represents a Hub in the application.

    Attributes:
    - name: StringField, required, max_length=100, min_length=1
    - section: StringField
    - description: StringField, max_length=280
    - creator_id: ObjectIdField, required
    - theme_color: StringField
    - photo_url: URLField
    - members_id: DictField(field=ListField(ObjectIdField())), required
    - auth_option: StringField(choices=("open_to_anyone", "lobby", "institute_id"),
    default="open_to_anyone")
    - invite_code: StringField, unique=True
    - institute_id: StringField
    - streaming_url: URLField, unique=True
    - recordings: ListField(EmbeddedDocumentField(Recording))
    - quizzes: ListField(EmbeddedDocumentField(Quiz))
    - assignments: ListField(EmbeddedDocumentField(Assignment))
    - posts: ListField(EmbeddedDocumentField(Post))
    - messages: ListField(EmbeddedDocumentField(Message))
    - created_at: DateTimeField(), required
    """

    name = StringField(required=True, max_length=100, min_length=1)
    section = StringField()
    description = StringField(max_length=280)
    topics = SetField()
    creator_id = ObjectIdField(required=True)
    theme_color = StringField()
    photo_url = URLField()
    members_id = DictField(field=ListField(ObjectIdField()), required=True)
    auth_option = StringField(
        choices=("open_to_anyone", "lobby", "institute_id"), default="open_to_anyone"
    )
    invite_code = StringField(unique=True)
    institute_id = StringField()
    room_code_teacher = StringField()
    room_code_student = StringField()
    room_code_ta = StringField()
    recordings = ListField(EmbeddedDocumentField(Recording))
    quizzes = ListField(EmbeddedDocumentField(Quiz))
    assignments = ListField(MapField(EmbeddedDocumentField(Assignment)))
    assignments_difficulty_level = ListField(StringField())
    posts = ListField(EmbeddedDocumentField(Post))
    messages = ListField(EmbeddedDocumentField(Message))
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))

    meta = {
        "collection": "hubs",
        "indexes": [
            {"fields": ["creator_id"]},
        ],
    }
