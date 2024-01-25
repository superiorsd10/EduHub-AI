"""
Module containing the User model for the application.
"""

from mongoengine import (
    Document,
    StringField,
    EmailField,
    ObjectIdField,
    ListField,
    DictField,
    EmbeddedDocumentField,
    EmbeddedDocument,
    Decimal128Field,
    DateTimeField,
)


class Assignment(EmbeddedDocument):
    """
    Represents an assignment in the User model.

    Attributes:
    - assignment_id: ObjectIdField, required
    - marks: Decimal128Field
    """

    assignment_id = ObjectIdField(required=True)
    marks = Decimal128Field()


class Quiz(EmbeddedDocument):
    """
    Represents a quiz in the User model.

    Attributes:
    - quiz_id: ObjectIdField, required
    - marks: Decimal128Field
    - time_spent: DateTimeField
    """

    quiz_id = ObjectIdField(required=True)
    marks = Decimal128Field()
    time_spent = DateTimeField()


class User(Document):
    """
    Represents a User in the application.

    Attributes:
    - name: StringField, required
    - email: EmailField, required
    - hubs: DictField(field=ListField(ObjectIdField()))
    - assignments: ListField(EmbeddedDocumentField(Assignment))
    - quizzes: ListField(EmbeddedDocumentField(Quiz))

    Meta:
    - collection: "users"
    - indexes: [
        {"fields": ["email"], "unique": True},
    ]
    """

    name = StringField(required=True)
    email = EmailField(required=True)
    hubs = DictField(field=ListField(ObjectIdField()))
    assignments = ListField(EmbeddedDocumentField(Assignment))
    quizzes = ListField(EmbeddedDocumentField(Quiz))

    meta = {
        "collection": "users",
        "indexes": [
            {"fields": ["email"], "unique": True},
        ],
    }
