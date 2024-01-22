from mongoengine import (
    Document,
    StringField,
    DictField,
    DateTimeField,
    URLField,
)


class Post(Document):
    post_type = StringField(choices = ('Post','Question','Material') , default = 'Post')
    title = StringField()
    description = StringField()
    attachments_url = URLField()
    topic = StringField()
    created_at = DateTimeField()