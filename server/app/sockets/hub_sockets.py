"""
Hub sockets for the Flask application.
"""

from flask import current_app
from flask_socketio import emit
from app.app import socketio
from app.models.hub import Hub
from bson.objectid import ObjectId
from app.models.user import User


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

        hub_invitation_list_key = f"hub_{str(hub_data.id)}_invitation_list"
        redis_client.rpush(hub_invitation_list_key, email)

        emit(
            "invite-sent-success",
            {
                "message": "Invite sent successfully",
                "hub_id": hub_data.id,
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

        user_cache_key = f"user:{email}"
        redis_client = current_app.redis_client
        user_object_id = redis_client.hget(user_cache_key, "user_object_id")
        user_object_id = ObjectId(user_object_id.decode("utf-8"))

        user = User.objects(id=user_object_id).first()
        user_id = user.id

        Hub.objects(id=hub_id).update_one(push__members_id__student=user_id)

        hub_invitation_list_key = f"hub_{hub_id}_invitation_list"
        redis_client.lrem(hub_invitation_list_key, 0, email)

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
        redis_client.lrem(hub_invitation_list_key, 0, email)

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
