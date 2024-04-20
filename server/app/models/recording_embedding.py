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
)


class RecordingEmbedding(Document):
    """
    A MongoDB document representing embeddings generated from the text
    content of recordings in a room.

    This class is designed to facilitate the storage and retrieval
    of recording embeddings for analysis
    and machine learning purposes. The `room_id` field
    provide contextual information about
    the recording, while the `text_content` field stores the textual
    content extracted from the recording.
    The `embeddings` field contains the actual embeddings generated
    from the text content.

    The `RecordingEmbedding` class inherits from the `Document` class
    provided by the `mongoengine` library,
    which allows instances of this class to be directly stored and
    retrieved from a MongoDB database.

    Class Attributes:
        room_id (StringField): The unique identifier of the room. Required field.
        text_content (StringField): The textual content extracted from
        the recording. Required field.
        embeddings (ListField of FloatField): The embeddings generated from
        the text content. Required field.
        created_at (DateTimeField): The timestamp indicating when the
        recording embedding was created.

    Meta Attributes:
        collection (str): The name of the MongoDB collection where
        documents of this class will be stored.
        indexes (list of dict): List of indexes to be created for efficient querying.
    """

    room_id = StringField(required=True)
    text_content = StringField(required=True)
    embeddings = ListField(FloatField(), required=True)
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))

    meta = {
        "collection": "recording_embedding",
        "indexes": [
            {"fields": ["room_id"]},
        ],
    }
