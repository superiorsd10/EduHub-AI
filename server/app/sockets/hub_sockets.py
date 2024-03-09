"""
Hub sockets for the Flask application.
"""

from flask_socketio import emit, close_room
from app.app import socketio
from app.models.hub import Hub


@socketio.on("accept-request")
def handle_accept_request(data):
    """
    Handles accepting a join request for a hub.

    This event handler updates the members_id dictionary of the Hub model
    to add the user ID to the "student" list,
    emits a notification to the accepted user, and then closes
    the WebSocket connection between the two parties.

    Args:
        data (dict): A dictionary containing the following keys:
            - user_id (ObjectID): The ID of the user whose join
            request is being accepted.
            - hub_id (ObjectID): The ID of the hub to which the user is being joined.
            - room_id (str): The ID of the WebSocket room representing
            the connection between the two parties.

    Raises:
        Exception: If an unexpected error occurs during the
        handling of the accept request.

    Emits:
        join_request_accepted (dict): An event emitted to the accepted
        user containing the following data:
            - hub_id (ObjectID): The ID of the hub to which the user is being joined.

        error (dict): An event emitted if an error occurs during the handling of the accept request,
            containing the following data:
            - message (str): A message indicating the error that occurred.


    """
    try:
        user_id = data.get("user_id")
        hub_id = data.get("hub_id")
        room_id = data.get("room_id")

        Hub.objects(id=hub_id).update_one(push__members_id__student=user_id)

        emit("join_request_accepted", {"hub_id": hub_id}, room=room_id)
        close_room(room_id)
    except Exception as error:
        emit("error", {"message": f"An error occurred: {error}"}, room=room_id)


@socketio.on("reject_request")
def handle_reject_request(data):
    """
    Handles rejecting a join request for a hub.

    This event handler closes the WebSocket connection between the
    two parties.

    Args:
        data (dict): A dictionary containing the following key:
            - room_id (str): The ID of the WebSocket room representing
            the connection between the two parties.

    Raises:
        Exception: If an unexpected error occurs during the handling of the reject request.

    Emits:
        error (dict): An event emitted if an error occurs during the handling of the reject request,
            containing the following data:
            - message (str): A message indicating the error that occurred.


    """
    try:
        room_id = data.get("room_id")
        close_room(room_id)

    except Exception as error:
        emit("error", {"message": f"An error occurred: {error}"}, room=room_id)
