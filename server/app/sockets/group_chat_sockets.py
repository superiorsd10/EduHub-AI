"""
Group Chat sockets for the Flask application.
"""

import base64
from bson import ObjectId
from flask import current_app
from flask_socketio import emit, join_room, leave_room
from app.app import socketio
from app.models.message import Message


def decode_base64_to_objectid(base64_encoded: str) -> ObjectId:
    """
    Decodes a base64 encoded string and converts it to an ObjectId.

    Args:
        base64_encoded (str): The base64 encoded string to decode.

    Returns:
        ObjectId: The decoded ObjectId.
    """
    decoded_bytes = base64.b64decode(base64_encoded)
    hex_string = decoded_bytes.decode("utf-8")
    object_id = ObjectId(hex_string)
    return object_id


@socketio.on("join-hub")
def handle_join_hub(data):
    """
    Handle a request to join a hub.

    Args:
        data (dict): A dictionary containing data related to the join-hub request.
            It should contain the following key:
            - "hub_id" (str): The ID of the hub to join.

    Raises:
        Exception: If an error occurs during the handling of the request.

    Returns:
        None
    """
    try:
        hub_id = data.get("hub_id")
        join_room(hub_id)

    except Exception as error:
        emit(
            "error",
            {"message": f"An error occurred: {error}"},
        )


@socketio.on("leave-hub")
def handle_leave_hub(data):
    """
    Handle a request to leave a hub.

    Args:
        data (dict): A dictionary containing data related to the leave-hub request.
            It should contain the following key:
            - "hub_id" (str): The ID of the hub to leave.

    Raises:
        Exception: If an error occurs during the handling of the request.

    Returns:
        None
    """
    try:
        hub_id = data.get("hub_id")
        leave_room(hub_id)

    except Exception as error:
        emit(
            "error",
            {"message": f"An error occurred: {error}"},
        )


@socketio.on("send-message")
def handle_send_message(data):
    """
    Handle a request to send a message to a hub.

    Args:
        data (dict): A dictionary containing data related to the send-message request.
            It should contain the following keys:
            - "hub_id" (str): The base64 encoded ID of the hub to send the message to.
            - "name" (str): The name of the sender.
            - "email" (str): The email address of the sender.
            - "content" (str): The content of the message.

    Raises:
        Exception: If an error occurs during the handling of the request.

    Returns:
        None
    """
    try:
        hub_id = data.get("hub_id")
        name = data.get("name")
        email = data.get("email")
        content = data.get("content")

        hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)

        new_message = Message(
            hub_id=hub_object_id,
            name=name,
            email=email,
            content=content,
        )

        new_message.save()

        redis_client = current_app.redis_client
        chat_hub_id_key = f"chat:{hub_id}"
        redis_client.publish(chat_hub_id_key, new_message.to_json())

    except Exception as error:
        emit(
            "error",
            {"message": f"An error occurred: {error}"},
        )
