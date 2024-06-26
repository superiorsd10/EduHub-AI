"""
Hub sockets for the Flask application.
"""

import base64
import time
from bson import ObjectId
from flask import current_app
from flask_socketio import emit
from app.app import socketio
from app.models.hub import Hub


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


@socketio.on("invite-sent")
def handle_invite_sent(data):
    """
    Handle the event when a student sends an invitation.

    Args:
        data (dict): A dictionary containing the invite code and email.

    Emits:
        - "error": If the invite code is invalid or an error occurs.
        - "invite-sent-success": If the invitation is sent successfully.

    Raises:
        Exception: If an unexpected error occurs during the process.
    """
    try:
        invite_code = data.get("invite_code")
        email = data.get("email")

        hub_data = Hub.objects(invite_code=invite_code).first()

        if not hub_data:
            emit(
                "error",
                {"message": "Invalid invite code"},
            )
            return

        redis_client = current_app.redis_client

        hub_object_id = hub_data.id
        hub_invitation_list_key = f"hub_{hub_object_id}_invitation_list"
        timestamp = int(time.time())
        redis_client.zadd(hub_invitation_list_key, {email: timestamp})

        emit(
            "invite-sent-success",
            {
                "message": "Invite sent successfully",
                "hub_id": str(hub_object_id),
                "email": email,
            },
        )

    except Exception as error:
        emit(
            "error",
            {"message": f"An error occurred: {error}"},
        )


@socketio.on("accept-request")
def handle_accept_request(data):
    """
    Handle the event when a teacher accepts a student's join request for a hub.

    Args:
        data (dict): A dictionary containing the email of the student and the ID of the hub.

    Emits:
        - "join-request-accepted": If the request is accepted successfully.
        - "error": If an error occurs during the process.

    Raises:
        Exception: If an unexpected error occurs during the process.
    """
    try:
        email = data.get("email")
        hub_id = data.get("hub_id")
        hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)

        Hub.objects(id=hub_object_id).update_one(push__members_email__student=email)

        redis_client = current_app.redis_client
        hub_invitation_list_key = f"hub_{hub_id}_invitation_list"
        redis_client.zrem(hub_invitation_list_key, email)

        user_hub_object_id_role_key = f"user_{email}_hub_object_id_{hub_object_id}_role"
        redis_client.set(user_hub_object_id_role_key, "student")

        emit(
            "join-request-accepted",
            {
                "message": "Join request accepted",
                "hub_id": hub_id,
                "email": email,
            },
        )

    except Exception as error:
        emit(
            "error",
            {"message": f"An error occurred: {error}"},
        )


@socketio.on("reject-request")
def handle_reject_request(data):
    """
    Handle the event when a teacher rejects a student's join request for a hub.

    Args:
        data (dict): A dictionary containing the email of the student and the ID of the hub.

    Emits:
        - "join-request-rejected": If the request is rejected successfully.
        - "error": If an error occurs during the process.

    Raises:
        Exception: If an unexpected error occurs during the process.
    """
    try:
        email = data.get("email")
        hub_id = data.get("hub_id")

        redis_client = current_app.redis_client
        hub_invitation_list_key = f"hub_{hub_id}_invitation_list"
        redis_client.zrem(hub_invitation_list_key, email)

        emit(
            "join-request-rejected",
            {
                "message": "Join request rejected",
                "hub_id": hub_id,
                "email": email,
            },
        )

    except Exception as error:
        emit(
            "error",
            {"message": f"An error occurred: {error}"},
        )
