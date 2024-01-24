from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    URLField,
    IntField,
    ObjectIdField,
)


class Assignment(Document):
    hub_id = ObjectIdField(required=True)
    title = StringField(required=True)
    difficulty = StringField(choices=("easy", "medium", "hard"), default="medium")
    instructions = StringField()
    attachments_url = URLField()
    total_points = IntField()
    due_datetime = DateTimeField()
    topic = StringField()
    scheduled_datetime = DateTimeField()
    created_at = DateTimeField()

    meta = {
        "collection": "assignments",
        "indexes": [
            {"fields": ["hub_id"]},
            {"fields": ["topic"]},
        ],
    }
