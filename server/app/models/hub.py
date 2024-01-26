"""
Module containing the Hub model for the application.
"""

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
)


class Recording(EmbeddedDocument):
    """
    Represents a recording in the Hub.

    Attributes:
    - url: URLField
    - summary: StringField
    """

    url = URLField()
    summary = StringField()


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

    type = StringField(choices=("announcement", "material"), required=True)
    title = StringField(required=True)
    description = StringField()
    attachments_url = URLField()
    attachments_type = ListField(StringField())
    topic = StringField()
    created_at = DateTimeField()
    poll_options = ListField(StringField())
    emoji_reactions = DictField(field=StringField())

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
    emoji_reactions = DictField(field=StringField())


class Hub(Document):
    """
    Represents a Hub in the application.

    Attributes:
    - name: StringField, required
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
    """

    name = StringField(required=True)
    creator_id = ObjectIdField(required=True)
    theme_color = StringField()
    photo_url = URLField()
    members_id = DictField(field=ListField(ObjectIdField()), required=True)
    auth_option = StringField(
        choices=("open_to_anyone", "lobby", "institute_id"), default="open_to_anyone"
    )
    invite_code = StringField(unique=True)
    institute_id = StringField()
    streaming_url = URLField(unique=True)
    recordings = ListField(EmbeddedDocumentField(Recording))
    quizzes = ListField(EmbeddedDocumentField(Quiz))
    assignments = ListField(EmbeddedDocumentField(Assignment))
    posts = ListField(EmbeddedDocumentField(Post))
    messages = ListField(EmbeddedDocumentField(Message))

    meta = {
        "collection": "hubs",
    }
