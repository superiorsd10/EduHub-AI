"""
Recording routes for the Flask application.
"""

from flask import Blueprint, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.enums import StatusCode
from app.core import limiter
from app.celery.tasks.recording_tasks import process_image_files
from app.models.recording_embedding import RecordingEmbedding
from config.config import Config
from marshmallow import Schema, fields
import smart_open
import google.generativeai as genai
import redis

recording_blueprint = Blueprint("recording", __name__)


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
                text_content = None

                with smart_open.open(
                    transcript_txt_presigned_url, "rb"
                ) as transcript_file:
                    text_content = transcript_file.read().decode("utf-8")

                embedding_docs = []

                num_chunks = len(text_content)
                counter = 0

                for i in range(0, num_chunks, 1000):
                    chunk = text_content[i : i + 1000]
                    embedding = extract_text_embedding(chunk)
                    counter += 1
                    embedding_doc = RecordingEmbedding(
                        room_id=room_id,
                        text_content=chunk,
                        embeddings=embedding,
                    )
                    embedding_docs.append(embedding_doc)

                RecordingEmbedding.objects.insert(embedding_docs, load_bulk=False)

                recording_number_of_embeddings_key = (
                    f"room_id_{room_id}_number_of_recording_embeddings"
                )

                redis_client = Config.redis_client

                with redis_client.pipeline() as pipe:
                    try:
                        existing_value = pipe.get(recording_number_of_embeddings_key)
                        if existing_value:
                            pipe.incrby(recording_number_of_embeddings_key, counter)
                        else:
                            pipe.set(recording_number_of_embeddings_key, counter)

                        pipe.execute()
                    except redis.exceptions.RedisError as error:
                        print(f"Error updating recording embeddings count: {error}")
                    else:
                        print(
                            f"Recording embeddings count updated for room_id: {room_id}"
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
@firebase_token_required
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

        return (
            jsonify({"message": "Successfully processed the images", "success": True}),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )
