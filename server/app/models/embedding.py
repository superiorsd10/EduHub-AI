"""
Module containing the Embedding model for the application.
"""

from datetime import datetime
from mongoengine import (
    Document,
    DateTimeField,
    FloatField,
    ListField,
    StringField,
    IntField,
)


class Embedding(Document):
    """
    MongoEngine model for storing text embeddings associated with a post in a hub.

    Attributes:
        hub_id (str): The ID of the hub to which the post belongs.
        post_id (UUID): The UUID of the post to which the embeddings are associated.
        embeddings (list): List of lists containing embedding vectors
        representing text content.
        created_at (DateTime): Timestamp indicating when the embeddings were created.

    """

    hub_id = StringField(required=True)
    post_id = StringField(required=True)
    attachment_id = StringField(required=True)
    batch_no = IntField(required=True)
    text_content = StringField(required=True)
    embeddings = ListField(FloatField(), required=True)
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))

    meta = {
        "collection": "embedding",
        "indexes": [
            {"fields": ["attachment_id"]},
        ],
    }
