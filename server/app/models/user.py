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
    URLField,
    BooleanField,
    IntField,
)


class Assignments(EmbeddedDocument):
    assignment_id = ObjectIdField(required=True)
    marks = Decimal128Field()


class Quizzes(EmbeddedDocument):
    quiz_id = ObjectIdField(required=True)
    marks = Decimal128Field()
    time_spent = DateTimeField()


class Recording(EmbeddedDocument):
    recording_id = ObjectIdField(required = True)
    url = URLField()
    summary = StringField()


class Question(EmbeddedDocument):
    question_id = ObjectIdField(required = True)
    question_type = StringField(choices = ('Single Correct','Multi Correct','Descriptive') , default = 'Single Correct')
    image_url = URLField()
    text = StringField()
    marks = IntField()
    # options
    # answers


class Quiz(EmbeddedDocument):
    title = StringField()
    description = StringField()
    duration = DateTimeField()
    total_points = IntField()
    topic = StringField()
    created_at = DateTimeField()
    question = ListField(EmbeddedDocumentField(Question))


class Assignment(EmbeddedDocument):
    title = StringField()
    difficulty = StringField(choices = ('Easy','Medium','Hard') , default = 'Medium')
    instructions = StringField()
    attachments_url = URLField()
    total_points = IntField()
    due_datetime = DateTimeField()
    topic = StringField()
    scheduled_datetime = DateTimeField()
    created_at = DateTimeField()


class Post(EmbeddedDocument):
    post_type = StringField(choices = ('Post','Question','Material') , default = 'Post')
    title = StringField()
    description = StringField()
    attachments_url = URLField()
    topic = StringField()
    created_at = DateTimeField()


class User(Document):
    name = StringField()
    email = EmailField()
    role = StringField()
    classes = DictField(field=ListField(ObjectIdField()))
    assignments = ListField(EmbeddedDocumentField(Assignments))
    quizzes = ListField(EmbeddedDocumentField(Quizzes))

    meta = {"collection": "users", "indexes": [{"fields": ["email"], "unique": True}]}


class Classes(Document):
    name = StringField()
    creator_id = ObjectIdField(required=True)
    theme_color = StringField()
    photo_url = URLField()
    members_id = DictField(field=ListField(ObjectIdField()))
    auth_option = StringField(choices = ('Open to Anyone','Lobby','InstituteID') , default = 'Open to Anyone')
    invite_code = StringField()
    selected_institute_id = BooleanField(default = False)
    streaming_url = URLField()
    recordings = ListField(EmbeddedDocumentField(Recording))
    quizzes = ListField(EmbeddedDocumentField(Quiz))
    assignments = ListField(EmbeddedDocumentField(Assignment))
    posts = ListField(EmbeddedDocumentField(Post))
    # group_messages
