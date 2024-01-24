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
