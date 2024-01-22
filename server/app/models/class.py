from mongoengine import (
    Document,
    StringField,
    ObjectIdField,
    ListField,
    DictField,
    EmbeddedDocumentField,
    EmbeddedDocument,
    URLField,
    BooleanField,
)


class Recording(EmbeddedDocument):
    recording_id = ObjectIdField(required = True)
    url = URLField()
    summary = StringField()


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
    # quizzes = ListField(EmbeddedDocumentField(Quiz))
    # assignments = ListField(EmbeddedDocumentField(Assignment))
    # posts = ListField(EmbeddedDocumentField(Post))
    # group_messages
