from mongoengine import (
    Document,
    StringField,
    ObjectIdField,
    ListField,
    EmbeddedDocumentField,
    EmbeddedDocument,
    DateTimeField,
    URLField,
    IntField,
)


class Question(EmbeddedDocument):
    question_id = ObjectIdField(required = True)
    question_type = StringField(choices = ('Single Correct','Multi Correct','Descriptive') , default = 'Single Correct')
    image_url = URLField()
    text = StringField()
    marks = IntField()
    # options
    # answers


class Quiz(Document):
    title = StringField()
    description = StringField()
    duration = DateTimeField()
    total_points = IntField()
    topic = StringField()
    created_at = DateTimeField()
    question = ListField(EmbeddedDocumentField(Question))
