from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    URLField,
    IntField,
)


class Assignment(Document):
    title = StringField()
    difficulty = StringField(choices = ('Easy','Medium','Hard') , default = 'Medium')
    instructions = StringField()
    attachments_url = URLField()
    total_points = IntField()
    due_datetime = DateTimeField()
    topic = StringField()
    scheduled_datetime = DateTimeField()
    created_at = DateTimeField()