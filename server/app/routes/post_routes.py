"""
Post routes for the Flask application.
"""

import os
import uuid
import mimetypes
import math
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
from config.config import Config


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
# @limiter.limit("5 per minute")
# @firebase_token_required
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
        task_ids = []
        hub_object_id = decode_base64_to_objectid(str(hub_id))
        post_uuid = str(uuid.uuid4())

        redis_client = Config.redis_client

        for file in files:
            if file and allowed_file(file.filename):
                file_data = file.read()
                filename = secure_filename(file.filename)
                extension = os.path.splitext(filename)[1]
                attachment_uuid = str(uuid.uuid4())
                unique_filename = attachment_uuid + extension

                file_key = f"posts/{hub_id}/{unique_filename}"
                s3_client.put_object(
                    Body=file_data,
                    Bucket="eduhub-ai",
                    Key=file_key,
                    ContentType=mimetypes.guess_type(filename)[0],
                )
                file_url = f"https://d2zvmtskygrsot.cloudfront.net/{file_key}"
                uploaded_file_urls.append(file_url)
                task = process_uploaded_file.apply_async(
                    args=[
                        file_data,
                        filename,
                        hub_id,
                        post_uuid,
                        attachment_uuid,
                    ],
                    retry_policy={
                        "max_retries": 3,
                        "interval_start": 2,
                        "interval_step": 2,
                        "interval_max": 10,
                    },
                )
                task_ids.append(task.id)

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

        cache_paginated_key = f"hub_{hub_object_id}_paginated_page_1"
        cache_introductory_key = f"hub_{hub_object_id}_introductory"

        redis_client.delete(cache_paginated_key, cache_introductory_key)

        for task_id in task_ids:
            redis_client.publish(f"{task_id}", "PENDING")

        return (
            jsonify(
                {
                    "uuid": post.uuid,
                    "type": post.type,
                    "title": post.title,
                    "description": post.description,
                    "topic": post.topic,
                    "attachments_url": post.attachments_url,
                    "created_at": post.created_at.isoformat(),
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


@post_blueprint.route("/api/<hub_id>/get-post/<post_id>", methods=["GET"])
def get_post(hub_id, post_id):
    """
    Retrieve a specific post within a hub.

    This endpoint allows users to retrieve a specific post within the specified hub
    identified by its unique ID and the post's UUID.

    Args:
        hub_id (str): The unique identifier of the hub where the post belongs.
        post_id (str): The UUID of the post to retrieve.
    """
    try:
        hub_object_id = decode_base64_to_objectid(hub_id)
        post = (
            Hub.objects(id=hub_object_id, posts__uuid=post_id).only("posts.$").first()
        )

        if post:
            post_data = post.posts[0].to_mongo().to_dict()
            return (
                jsonify(post_data),
                StatusCode.SUCCESS.value,
            )
        return (
            jsonify({"error": "Post not found", "success": False}),
            StatusCode.NOT_FOUND.value,
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

        redis_client = Config.redis_client
        attachment_number_of_embeddings_key = (
            f"attachment_id_{attachment_id}_number_of_embeddings"
        )
        attachment_previous_conversation_key = (
            f"attachment_id_{attachment_id}_previous_conversation"
        )
        attachment_cached_data = redis_client.mget(
            attachment_number_of_embeddings_key, attachment_previous_conversation_key
        )

        number_of_embeddings = attachment_cached_data[0]
        number_of_embeddings = int(number_of_embeddings.decode("utf-8"))
        limit_results = math.ceil(math.sqrt(number_of_embeddings))

        previous_conversation = attachment_cached_data[1]

        results = Embedding.objects.aggregate(
            [
                {
                    "$vectorSearch": {
                        "index": "embeddedVectorIndex",
                        "path": "embeddings",
                        "queryVector": query_embeddings,
                        "filter": {"attachment_id": str(attachment_id)},
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
            attachment_previous_conversation_key, previous_conversation, ex=3600
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
