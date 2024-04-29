"""
Module containing the Assignment model for the application.
"""

from datetime import datetime
from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    IntField,
    ObjectIdField,
    ListField,
    BooleanField,
    DictField,
)


class Assignment(Document):
    """
    Represents an assignment in the application.

    Attributes:
    - hub_id: ObjectIdField, required
    - title: StringField, required
    - difficulty: StringField, choices=("easy", "medium", "hard"), default="medium"
    - instructions: StringField
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
    total_points = IntField()
    question = StringField(required=True)
    answer = StringField()
    responses = DictField(StringField())
    question_points = ListField(field=IntField())
    due_datetime = DateTimeField()
    topic = StringField()
    automatic_grading_enabled = BooleanField()
    automatic_feedback_enabled = BooleanField()
    plagiarism_checker_enabled = BooleanField()
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))

    meta = {
        "collection": "assignments",
        "indexes": [
            {"fields": ["hub_id"]},
            {"fields": ["topic"]},
        ],
    }
