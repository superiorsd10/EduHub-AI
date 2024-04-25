"""
Module containing the Assignment model for the application.
"""

from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    URLField,
    IntField,
    ObjectIdField,
    ListField,
)


class Assignment(Document):
    """
    Represents an assignment in the application.

    Attributes:
    - hub_id: ObjectIdField, required
    - title: StringField, required
    - difficulty: StringField, choices=("easy", "medium", "hard"), default="medium"
    - instructions: StringField
    - attachments_url: URLField
    - total_points: IntField
    - question = StringField, required
    - answer = StringField
    - question_points = ListField(field=IntField())
    - due_datetime: DateTimeField
    - topic: StringField
    - created_at: DateTimeField

    Meta:
    - collection: "assignments"
    - indexes: [
        {"fields": ["hub_id"]},
        {"fields": ["topic"]},
    ]
    """

    hub_id = ObjectIdField(required=True)
    title = StringField(required=True)
    difficulty = StringField(choices=("easy", "medium", "hard"), default="medium")
    instructions = StringField()
    attachments_url = URLField()
    total_points = IntField()
    question = StringField(required=True)
    answer = StringField()
    question_points = ListField(field=IntField())
    due_datetime = DateTimeField()
    topic = StringField()
    created_at = DateTimeField()

    meta = {
        "collection": "assignments",
        "indexes": [
            {"fields": ["hub_id"]},
            {"fields": ["topic"]},
        ],
    }
