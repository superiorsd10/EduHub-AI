"""
Module containing the Quiz model for the application.
"""

from mongoengine import (
    Document,
    StringField,
    ListField,
    EmbeddedDocumentField,
    EmbeddedDocument,
    DateTimeField,
    URLField,
    IntField,
    ObjectIdField,
)


class Question(EmbeddedDocument):
    """
    Represents a question in the Quiz.

    Attributes:
    - type: StringField, choices=("single_correct", "multi_correct", "descriptive"),
    default="single_correct", required
    - image_url: URLField
    - text: StringField, required
    - marks: IntField, required
    - options: ListField(StringField())
    - answers: StringField, required
    """

    type = StringField(
        choices=("single_correct", "multi_correct", "descriptive"),
        default="single_correct",
        required=True,
    )
    image_url = URLField()
    text = StringField(required=True)
    marks = IntField(required=True)
    options = ListField(StringField())
    answers = StringField(required=True)


class Quiz(Document):
    """
    Represents a Quiz in the application.

    Attributes:
    - hub_id: ObjectIdField, required
    - title: StringField
    - description: StringField
    - duration: DateTimeField
    - total_points: IntField
    - topic: StringField
    - created_at: DateTimeField
    - due_datetime: DateTimeField
    - questions: ListField(EmbeddedDocumentField(Question))

    Meta:
    - collection: "quizzes"
    - indexes: [
        {"fields": ["hub_id"]},
        {"fields": ["topic"]},
    ]
    """

    hub_id = ObjectIdField(required=True)
    title = StringField()
    description = StringField()
    duration = DateTimeField()
    total_points = IntField()
    topic = StringField()
    created_at = DateTimeField()
    due_datetime = DateTimeField()
    questions = ListField(EmbeddedDocumentField(Question))

    meta = {
        "collection": "quizzes",
        "indexes": [
            {"fields": ["hub_id"]},
            {"fields": ["topic"]},
        ],
    }
