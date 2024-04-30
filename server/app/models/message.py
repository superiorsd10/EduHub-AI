"""
Module containing the Message model for the application.
"""

from datetime import datetime
from mongoengine import (
    Document,
    DateTimeField,
    StringField,
    ObjectIdField,
)


class Message(Document):
    """
    Represents a message associated with a hub.

    Attributes:
        hub_id (ObjectId): The ID of the hub to which the message belongs. Required field.
        name (str): The name of the sender of the message. Required field.
        email (str): The email address of the sender of the message. Required field.
        content (str): The content of the message. Required field.
        created_at (datetime): The timestamp when the message was created. Defaults to the current time.
    """

    hub_id = ObjectIdField(required=True)
    name = StringField(required=True)
    email = StringField(required=True)
    content = StringField(required=True)
    created_at = DateTimeField(default=datetime.now().replace(microsecond=0))

    meta = {
        "collection": "messages",
        "indexes": [
            {"fields": ["hub_id"]},
        ],
    }
