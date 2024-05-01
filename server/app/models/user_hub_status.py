"""
Module containing the UserHubStatus model for the application.
"""

from mongoengine import (
    Document,
    DateTimeField,
    StringField,
)


class UserHubStatus(Document):
    """
    Represents the status of a user within a hub.

    Attributes:
        email (str): The email address of the user.
        hub_id (str): The ObjectId of the hub.
        last_read_timestamp (datetime): The timestamp indicating when the user last read activity in the hub.

    Meta:
        collection (str): The name of the MongoDB collection.
        indexes (list): List of indexes for efficient querying.
    """

    email = StringField(required=True)
    hub_id = StringField(required=True)
    last_read_timestamp = DateTimeField(required=True)

    meta = {
        "collection": "user_hub_status",
        "indexes": [
            {"fields": ["email"]},
            {"fields": ["hub_id"]},
        ],
    }
