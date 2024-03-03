"""
Post routes for the Flask application.
"""

import os
import uuid
import mimetypes
from datetime import datetime
import base64
from flask import Blueprint, request, current_app, jsonify
from werkzeug.utils import secure_filename
from app.auth.firebase_auth import firebase_token_required
from app.core import limiter
from marshmallow import Schema, fields, ValidationError
from app.enums import StatusCode
from app.models.hub import Post, Hub
from app.models.embedding import Embedding
from bson import ObjectId
from app.celery.tasks.post_tasks import process_uploaded_file
import google.generativeai as genai


post_blueprint = Blueprint("post", __name__)

ALLOWED_EXTENSIONS = {"ppt", "pdf", "jpg", "jpeg", "docx", "png"}


def validate_type(value: str):
    """
    Validates the type of a post.

    Args:
        value (str): The type of the post to validate.

    Raises:
        ValidationError: If the type is not one of ["announcement", "material"].

    Returns:
        None
    """
    if value not in ["announcement", "material"]:
        raise ValidationError("Type must be either announcement or material")


def allowed_file(filename: str) -> bool:
    """
    Checks if a file has an allowed extension.

    Args:
        filename (str): The name of the file to check.

    Returns:
        bool: True if the file has an allowed extension, False otherwise.
    """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def decode_base64_to_objectid(base64_encoded: str) -> ObjectId:
    """
    Decodes a base64 encoded string and converts it to an ObjectId.

    Args:
        base64_encoded (str): The base64 encoded string to decode.

    Returns:
        ObjectId: The decoded ObjectId.
    """
    decoded_bytes = base64.urlsafe_b64decode(base64_encoded)
    hex_string = decoded_bytes.hex()
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


class CreatePostSchema(Schema):
    """
    Schema for validating and serializing data when creating a post.

    This schema defines the structure of data expected when creating a post,
    including its type, title, description, topic, and any attached files.

    Attributes:
        type (str): The type of the post, which must be either "announcement" or "material".
            Required.
        title (str): The title of the post. Required.
        description (str, optional): A description of the post.
        topic (str, optional): The topic or category of the post.
        files (list of fields.Field, optional): A list of attached files.
            Each file is represented by a field, allowing for validation of file attributes.

    Note:
        - The `type` attribute must be one of the predefined values: "announcement" or "material".
        - If a file is attached, it should be represented as a list of fields.
        - Use the `load` method to validate and deserialize data from an incoming request.
    """

    type = fields.String(required=True, validate=validate_type)
    title = fields.String(required=True)
    description = fields.String()
    topic = fields.String()
    files = fields.List(fields.Field())


class ChatWithMaterialSchema(Schema):
    """
    Represents a schema for handling chat data with material.

    Attributes:
        query (str): The query string associated with the chat.
    """

    query = fields.String(required=True)


@post_blueprint.route("/api/<hub_id>/create-post", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def create_post(hub_id):
    """
    Create a post within a specified hub.

    This endpoint allows authenticated users to create a new post within the
    specified hub identified by its unique ID. The post can include various
    details such as type, title, description, topic, and attached files.

    Args:
        hub_id (str): The unique identifier of the hub where the post will be created.

    Returns:
        tuple: A tuple containing a JSON response with a success message and status code.
            If successful, the response includes a success message indicating the
            successful creation of the post and a status code indicating success (200).
            If unsuccessful due to validation errors, the response includes an error
            message detailing the validation errors and a status code indicating a
            bad request (400). If any other unexpected errors occur during the
            process, an error message is returned along with an internal server
            error status code (500).

    Raises:
        ValidationError: If the provided data does not match the expected schema.
        ValueError: If the S3 client is not properly configured.
        Exception: If any other unexpected error occurs during the process.

    Note:
        - This endpoint requires Firebase authentication and rate limiting to prevent
          abuse.
        - The request body is expected to contain form data representing the attributes
          of the post, including its type, title, description, topic, and attached files.
        - The attached files should be included as a list of files, and each file will be
          uploaded to an Amazon S3 bucket for storage.
        - Upon successful creation of the post, the post object is added to the specified
          hub's list of posts and saved to the database.

    Example Usage:
        To create a new post within a hub, send a POST request to the endpoint with
        the required form data in the request body. The endpoint requires a valid
        Firebase authentication token for authorization.

    """
    try:
        schema = CreatePostSchema()
        data = schema.load(request.form)

        s3_client = current_app.config["S3_CLIENT"]
        if not s3_client:
            raise ValueError("S3 client not configured")

        files = request.files.getlist("files")

        uploaded_file_urls = []

        hub_object_id = decode_base64_to_objectid(hub_id)
        post_uuid = str(uuid.uuid4())

        for file in files:
            if file and allowed_file(file.filename):
                file_data = file.read()
                filename = secure_filename(file.filename)
                extension = os.path.splitext(filename)[1]
                attachment_uuid = str(uuid.uuid4())
                unique_filename = attachment_uuid + extension

                file_key = f"posts/{hub_id}/{unique_filename}"
                s3_client.upload_fileobj(
                    file,
                    "eduhub-ai",
                    file_key,
                    ExtraArgs={"ContentType": mimetypes.guess_type(filename)[0]},
                )
                file_url = f"https://eduhub-ai.s3.amazonaws.com/{file_key}"
                uploaded_file_urls.append(file_url)
                process_uploaded_file.delay(
                    file_data,
                    filename,
                    hub_id,
                    post_uuid,
                    attachment_uuid,
                )

        post = Post(
            uuid=post_uuid,
            type=data.get("type"),
            title=data.get("title"),
            description=data.get("description"),
            topic=data.get("topic"),
            attachments_url=uploaded_file_urls,
            created_at=datetime.now().replace(microsecond=0),
        )

        Hub.objects(id=hub_object_id).update_one(push__posts=post)

        return (
            jsonify(
                {
                    "message": "Post created successfully",
                    "success": True,
                }
            ),
            StatusCode.SUCCESS.value,
        )
    except ValidationError as error:
        return (
            jsonify({"error": error.messages, "success": False}),
            StatusCode.BAD_REQUEST.value,
        )
    except ValueError as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )
    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@post_blueprint.route("/api/chat-with-material/<attachment_id>", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def chat_with_material(attachment_id):
    """
    Handle chat with material based on provided attachment_id.

    This endpoint receives a POST request containing a JSON payload with a 'query' field,
    representing the user's question. It then performs a vector search on the database
    using the provided query, constrained by the attachment_id. After retrieving the
    context related to the query, it prompts the generative model to provide an informative
    response to the question based on the retrieved context.

    Args:
        attachment_id (str): The ID of the material attachment.

    Returns:
        tuple: A tuple containing JSON response and HTTP status code.
            - If the operation is successful, returns a JSON response with the generated answer
              and success status along with HTTP status code 200 (OK).
            - If an error occurs, returns a JSON response with error message and failure status
              along with HTTP status code 500 (Internal Server Error).
    """
    try:
        schema = ChatWithMaterialSchema()
        data = schema.load(request.get_json())

        query = data.get("query")

        query_embeddings = extract_text_embedding(query)

        results = Embedding.objects.aggregate(
            [
                {
                    "$vectorSearch": {
                        "index": "embeddedVectorIndex",
                        "path": "embeddings",
                        "queryVector": query_embeddings,
                        "filter": {"attachment_id": str(attachment_id)},
                        "numCandidates": 1,
                        "limit": 1,
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

        retrieved_context = list(results)[0]["text_content"]

        prompt = f"""
        Instruction: Please provide an informative response to the following question based on the Retrieved Context

        Question: {query}

        Retrieved Context: {retrieved_context}
        """

        model = genai.GenerativeModel("gemini-pro")

        answer = model.generate_content(prompt)

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
