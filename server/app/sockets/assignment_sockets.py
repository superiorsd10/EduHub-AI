"""
Assignment sockets for the Flask application.
"""

import base64
import uuid
from bson import ObjectId
from flask_socketio import emit, join_room
from app.app import socketio
from app.models.hub import Hub
from app.celery.tasks.assignment_tasks import process_assignment_generation


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


@socketio.on("generate-assignment")
def generate_assignment(data):
    """
    Event handler for generating an assignment.

    Args:
        data (dict): A dictionary containing the following keys:
            - "hub_id" (str): The ID of the hub where the assignment will be generated.
            - "title" (str): The title of the assignment.
            - "topics" (list): A list of general topics for the assignment.
            - "specific_topics" (list): A list of specific topics for the assignment.
            - "instructions_for_ai" (str): Instructions for generating the assignment using AI.
            - "types_of_questions" (list): A list of types of questions for the assignment.

    Returns:
        None

    Raises:
        None

    Notes:
        - Joins the Socket.IO room corresponding to the hub ID.
        - Retrieves hub data based on the provided hub ID.
        - Generates a unique assignment ID using UUID.
        - Prints the generated assignment ID for debugging purposes.
        - Initiates the asynchronous task for generating the assignment using Celery.
        - If the hub data is not found, emits an error message to the client.
        - If any error occurs during the process, emits an error message to the client.

    """
    try:
        hub_id = data.get("hub_id")
        title = data.get("title")
        topics = data.get("topics")
        specific_topics = data.get("specific_topics")
        instructions_for_ai = data.get("instructions_for_ai")
        types_of_questions = data.get("types_of_questions")

        join_room(hub_id)

        hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)
        hub_data = Hub.objects(id=hub_object_id).first()

        if not hub_data:
            emit(
                "error",
                {"message": "Hub not found"},
            )

        assignments_count = len(hub_data.assignments)
        generate_assigment_id = str(uuid.uuid4())

        print(generate_assigment_id)

        process_assignment_generation.apply_async(
            args=[
                title,
                topics,
                specific_topics,
                instructions_for_ai,
                types_of_questions,
                generate_assigment_id,
                assignments_count,
                hub_id,
            ],
            retry_policy={
                "max_retries": 3,
                "interval_start": 2,
                "interval_step": 2,
                "interval_max": 10,
            },
        )

    except Exception as error:
        emit(
            "error",
            {"message": f"An error occurred: {error}"},
        )
