"""
Recording routes for the Flask application.
"""

import base64
from datetime import datetime, timedelta
import math
import uuid
from bson import ObjectId
from flask import Blueprint, current_app, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.enums import StatusCode
from app.core import limiter
from app.celery.tasks.recording_tasks import (
    process_image_files,
    process_recording_webhook,
)
from app.models.hub import Hub, Recording
from app.models.recording_embedding import RecordingEmbedding
from marshmallow import Schema, fields
import google.generativeai as genai

recording_blueprint = Blueprint("recording", __name__)


class CreateRecordingSchema(Schema):
    """
    Schema for validating data when creating a new recording.

    Attributes:
        title (str): The title or name of the recording. Required field.
        description (str, optional): A brief description or summary of the recording.
        topic (str, optional): The topic or subject matter associated with the recording.
        room_id (str): The unique identifier of the room where the recording took place.
    """

    title = fields.String(required=True)
    description = fields.String()
    topic = fields.String()
    room_id = fields.String()


class ProcessImageFilesSchema(Schema):
    """
    Schema for validating and serializing data related to processing image files.

    This Marshmallow schema defines the structure and validation rules for data
    related to processing image files. It specifies the required fields for identifying
    the room and hub associated with the image files, as well as the list of image files
    themselves.

    Attributes:
        room_id (fields.String): A string field representing the unique identifier of the room.
            This field is required.
        image_files (fields.List): A list field containing individual image files.
            This field is optional and can contain any type of data.
    """

    room_id = fields.String(required=True)
    image_files = fields.List(fields.Field())


class ChatWithRecordingSchema(Schema):
    """
    Represents a schema for handling chat data with recording.

    Attributes:
        query (str): The query string associated with the chat.
    """

    query = fields.String(required=True)


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


def extract_text_embedding(chunk: str) -> list:
    """
    Generate text embeddings for a text chunk using a pre-trained model.

    Args:
        chunk (str): The text chunk for which embeddings are to be generated.

    Returns:
        list: A list of embedding vectors representing the text chunk.

    Raises:
        Exception: If an error occurs during the embedding generation process.

    """
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=chunk,
            task_type="semantic_similarity",
        )
        return result["embedding"]
    except Exception as error:
        print(f"Error: {error}")
        raise


def convert_to_yyyymmdd(date_string: str) -> str:
    """
    Convert a date string in the format "Day, DD Month YYYY HH:MM:SS GMT"
    to the format "YYYYMMDD".

    Args:
        date_string (str): The input date string in the format
            "Day, DD Month YYYY HH:MM:SS GMT".

    Returns:
        str: The formatted date string in the format "YYYYMMDD".
    """
    date_object = datetime.strptime(date_string, "%Y-%m-%d %H:%M:%S")
    formatted_date = date_object.strftime("%Y%m%d")
    return formatted_date


@recording_blueprint.route("/api/<hub_id>/create-recording", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def create_recording(hub_id):
    """
    Create a new recording associated with a hub.

    This endpoint allows users to create a new recording and associate it with a specific hub.
    The provided data is validated using the CreateRecordingSchema before
    creating the recording instance.
    After creating the recording, it is added to the recordings list of the corresponding hub.
    Additionally, cached data related to the hub is cleared to reflect the recent changes.

    Args:
        hub_id (str): The unique identifier of the hub where the recording will be associated.

    Returns:
        tuple: A tuple containing JSON response data and HTTP status code.
            The JSON response contains details of the created recording, including its
            UUID, title, description, topic, room ID, and creation timestamp.
            If successful, the HTTP status code
            indicates success (201 - Created). If an error occurs during the process,
            the status code indicates an internal server error (500).

    Raises:
        Exception: If an error occurs during the creation or update of the recording.

    Notes:
        - This endpoint requires a valid Firebase authentication token for authorization.
        - The provided hub ID in the URL path specifies the hub where the recording will
        be associated.
        - Cached data related to the hub, such as paginated pages and introductory information,
        is cleared after creating the recording to ensure the cache reflects the recent changes.

    """
    try:
        schema = CreateRecordingSchema()
        data = schema.load(request.get_json())

        recording_uuid = str(uuid.uuid4())
        title = data.get("title")
        description = data.get("description")
        topic = data.get("topic")
        room_id = data.get("room_id")

        hub_object_id = decode_base64_to_objectid(base64_encoded=str(hub_id))

        recording = Recording(
            uuid=recording_uuid,
            title=title,
            description=description,
            topic=topic,
            room_id=room_id,
        )

        Hub.objects(id=hub_object_id).update_one(
            push__recordings=recording,
            push__topics=topic,
        )

        redis_client = current_app.redis_client
        cache_paginated_key = f"hub_{hub_object_id}_paginated_page_1"

        redis_client.delete(cache_paginated_key)

        return (
            jsonify(
                {
                    "uuid": recording.uuid,
                    "title": recording.title,
                    "description": recording.description,
                    "topic": recording.topic,
                    "room_id": recording.room_id,
                    "created_at": recording.created_at.isoformat(),
                }
            ),
            StatusCode.CREATED.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            500,
        )


@recording_blueprint.route(
    "/api/<hub_id>/get-recording/<recording_id>", methods=["GET"]
)
@limiter.limit("5 per minute")
# @firebase_token_required
def get_recording(hub_id, recording_id):
    """
    Retrieve a recording for a given hub.

    This endpoint retrieves a specific recording from the specified hub based on the provided
    hub ID and recording ID. It first decodes the hub ID from base64 format and then queries
    the MongoDB database to find the matching hub document containing the specified recording.
    If the recording is found, its data is extracted and returned in JSON format.

    Args:
        hub_id (str): The ID of the hub where the recording is stored.
        recording_id (str): The ID of the recording to retrieve.

    Returns:
        tuple: A tuple containing the JSON response and HTTP status code.

    Raises:
        Exception: If an error occurs during the retrieval process.

    """
    try:
        hub_object_id = decode_base64_to_objectid(hub_id)
        recording = (
            Hub.objects(id=hub_object_id, recordings__uuid=recording_id)
            .only("recordings.$")
            .first()
        )

        if recording:
            recording_data = recording.recordings[0].to_mongo().to_dict()
            created_at = recording_data["created_at"]
            room_id = recording_data["room_id"]
            adjusted_datetime = created_at - timedelta(hours=5, minutes=30)
            formatted_created_at = convert_to_yyyymmdd(
                date_string=str(adjusted_datetime)
            )

            recording_data["playlist_file_url"] = (
                f"https://d1h1k26a3spk7x.cloudfront.net/recordings/beam/{room_id}/{formatted_created_at}/playlist.m3u8"
            )

            return (
                jsonify({"message": recording_data, "success": True}),
                StatusCode.SUCCESS.value,
            )

        return (
            jsonify({"error": "Recording not found", "success": False}),
            StatusCode.NOT_FOUND.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@recording_blueprint.route("/api/recording-webhook", methods=["POST"])
def recording_webhook_listener():
    """
    Handle incoming webhook requests related to recordings.

    This function listens for POST requests sent to the '/api/recording-webhook' endpoint.
    It expects the request body to contain JSON data in the following format:

    If the request contains valid JSON data, it checks if the event type is "transcription.success".
    If so, it extracts relevant data from the "data" field for
    further processing, such as recording ID, room name, and duration.

    Returns:
        A JSON response indicating the success or failure of the webhook processing.
        - If the request contains valid JSON data and the event type is "transcription.success",
          it returns a success message along with an HTTP status code 200.
        - If the request does not contain valid JSON data,
        it returns an error message along with
        an HTTP status code 400 (Bad Request).
        - If an unexpected error occurs during processing,
        it returns an error message along with
        an HTTP status code 500 (Internal Server Error).
    """
    try:
        if request.is_json:
            webhook_data = request.get_json()

            if webhook_data.get("type") == "transcription.success":
                transcription_data = webhook_data.get("data")

                room_id = transcription_data.get("room_id")
                transcript_txt_presigned_url = transcription_data.get(
                    "transcript_txt_presigned_url"
                )

                process_recording_webhook.apply_async(
                    args=[transcript_txt_presigned_url, room_id],
                    retry_policy={
                        "max_retries": 3,
                        "interval_start": 2,
                        "interval_step": 2,
                        "interval_max": 10,
                    },
                )

            return (
                jsonify({"message": "Webhook received successfully", "success": True}),
                200,
            )

        return (
            jsonify({"error": "Invalid JSON data in request", "success": False}),
            400,
        )
    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            500,
        )


@recording_blueprint.route("/api/process-image-files", methods=["POST"])
@limiter.limit("5 per minute")
# @firebase_token_required
def process_image_files_endpoint():
    """
    Process uploaded image files to generate recording embeddings asynchronously.

    This Flask route handles POST requests for processing uploaded image files to generate
    recording embeddings. It extracts the room ID and hub ID from the request data, validates
    the request payload using a Marshmallow schema, and asynchronously executes the
    'process_image_files' Celery task to analyze the images and store the generated embeddings
    in a MongoDB database.

    Request Parameters:
        - room_id (str): The unique identifier of the room associated with the images.
        - image_files (FileStorage): The image files to be processed.

    Returns:
        A JSON response indicating the success or failure of the request.

    Raises:
        - BadRequest (400): If no image files are found in the request.
        - InternalServerError (500): If an unexpected error occurs during processing.

    Note:
        - The route is rate-limited to 5 requests per minute using Flask-Limiter.
        - The 'firebase_token_required' decorator ensures that the request is authenticated
          using Firebase authentication before proceeding.
        - The 'process_image_files' task is executed asynchronously using Celery, allowing
          for scalable and efficient processing of image files in the background.
        - Retry policy is configured for the Celery task to handle transient failures with
          exponential backoff.
    """
    try:
        schema = ProcessImageFilesSchema()
        data = schema.load(request.form)

        room_id = data.get("room_id")

        if "image_files" not in request.files:
            return (
                jsonify({"error": "No files found in request", "success": False}),
                StatusCode.BAD_REQUEST.value,
            )

        image_files = request.files.getlist("image_files")
        print(image_files)
        image_files_bytes = [image_file.read() for image_file in image_files]

        process_image_files.apply_async(
            args=[image_files_bytes, room_id],
            retry_policy={
                "max_retries": 3,
                "interval_start": 2,
                "interval_step": 2,
                "interval_max": 10,
            },
        )

        print("reached")

        return (
            jsonify({"message": "Successfully processed the images", "success": True}),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@recording_blueprint.route("/api/chat-with-recording/<room_id>", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def chat_with_recording(room_id):
    """
    Chat with a recording in a specified room, using a conversational AI model.

    This endpoint allows users to engage in a conversation related to a recording
    in a specified room.
    Users provide a query/question, and the endpoint generates an informative response based on the
    context of the recording, previous conversation, and the query itself.

    Args:
        room_id (str): The unique identifier of the room associated with the recording.

    Returns:
        tuple: A tuple containing a JSON response and an HTTP status code.
            - JSON response: A JSON object containing the success status and
            the generated answer/message.
            - HTTP status code: An integer representing the HTTP status of the response.

    Raises:
        Exception: An error occurred during the conversation processing or model generation.

    Note:
        - The endpoint expects a JSON payload containing the user's query.
        - The conversation context includes the retrieved context from the
        recording and any previous conversation.
        - The model used for generating responses is a Generative AI model capable
        of generating human-like text.
        - The generated answer/message is returned as part of the JSON response.
        - If the model is unable to generate a satisfactory answer, the user is provided
        with instructions.

    """
    try:
        schema = ChatWithRecordingSchema()
        data = schema.load(request.get_json())

        query = data.get("query")

        query_embeddings = extract_text_embedding(query)

        redis_client = current_app.redis_client
        recording_number_of_embeddings_key = (
            f"room_id_{room_id}_number_of_recording_embeddings"
        )
        recording_previous_conversation_key = f"room_id_{room_id}_previous_conversation"
        recording_cached_data = redis_client.mget(
            recording_number_of_embeddings_key, recording_previous_conversation_key
        )

        number_of_embeddings = recording_cached_data[0]
        number_of_embeddings = int(number_of_embeddings.decode("utf-8"))
        limit_results = math.ceil(math.sqrt(number_of_embeddings))

        previous_conversation = recording_cached_data[1]

        results = RecordingEmbedding.objects.aggregate(
            [
                {
                    "$vectorSearch": {
                        "index": "recordingEmbeddedVectorIndex",
                        "path": "embeddings",
                        "queryVector": query_embeddings,
                        "filter": {"room_id": str(room_id)},
                        "numCandidates": number_of_embeddings,
                        "limit": limit_results,
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "text_content": 1,
                    }
                },
            ]
        )

        retrieved_context = ""

        for result in list(results):
            retrieved_context += result["text_content"]

        if previous_conversation is not None:
            previous_conversation = previous_conversation.decode("utf-8")
        else:
            previous_conversation = "No previous conversation found!"

        if len(previous_conversation) > 10000:
            previous_conversation = previous_conversation[-10000:]

        prompt = f"""
        Instruction: Please provide an informative response to the following question with the help of your knowledge, the Retrieved Context and the Previous Conversation in Markdown format.

        Question: {query}

        Retrieved Context: {retrieved_context}

        Previous Conversation: {previous_conversation}

        Note: If the model is unable to generate an answer based on the retrieved context or previous conversation, please follow these instructions:

        1. Notify the user that the generated answer is based on the model's own knowledge.
        2. Provide an answer using the model's own knowledge.
        3. If possible, prompt something related to the topic to continue the conversation.
        """

        if len(prompt) > 25000:
            prompt = prompt[:25000]

        model = genai.GenerativeModel("gemini-pro")

        answer = model.generate_content(prompt)

        previous_conversation += f"user: {query}\nmodel: {answer.text}\n"
        redis_client.set(
            recording_previous_conversation_key, previous_conversation, ex=3600
        )

        return (
            jsonify(
                {
                    "success": True,
                    "message": answer.text,
                }
            ),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )
