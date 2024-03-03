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
    UUIDField,
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
    post_id = UUIDField(required=True)
    embeddings = ListField(ListField(FloatField()), required=True)
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))
