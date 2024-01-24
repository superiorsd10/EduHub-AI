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
    assignment_id = ObjectIdField(required=True)
    marks = Decimal128Field()


class Quiz(EmbeddedDocument):
    quiz_id = ObjectIdField(required=True)
    marks = Decimal128Field()
    time_spent = DateTimeField()


class User(Document):
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
