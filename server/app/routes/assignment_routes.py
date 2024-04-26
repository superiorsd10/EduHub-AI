"""
Assignment routes for the Flask application.
"""

import base64
from bson import ObjectId
from flask import Blueprint, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.enums import StatusCode
from app.core import limiter
from app.models.hub import Hub
from app.celery.tasks.assignment_tasks import process_assignment_generation
from marshmallow import Schema, fields

assignment_blueprint = Blueprint("assignment", __name__)


class GenerateAssignmentSchema(Schema):
    """
    Schema for validating assignment generation parameters.

    This schema defines the structure and validation rules for
    the parameters required to generate an assignment.
    It provides a consistent format for incoming assignment generation
    requests and ensures that the input data
    meets the specified requirements.

    Attributes:
        title (fields.String): A required string field representing
        the title of the assignment.
        topics (fields.List): An optional list field containing strings
        representing the general topics covered
                              in the assignment.
        specific_topics (fields.String): An optional string field specifying
        any specific topics within the general
                                         topics covered in the assignment.
        instructions_for_ai (fields.String): An optional string field
        providing instructions for automated tools
        or artificial intelligence systems that might be involved in
                                              generating or assessing the assignment.
        types_of_questions (fields.Mapping): A mapping field defining
        the types of questions included in the assignment
                                              along with the corresponding counts.

    Note:
        - The `types_of_questions` field expects a dictionary where
        each key represents a question type
          (e.g., "MCQ" for Multiple Choice Questions) and each value
          is a list containing the counts of
          questions of that type. For example, {"MCQ": [5, 5]} represents
          5 Multiple Choice Questions of each type.
        - The schema ensures that the `title` field is required, while
        other fields are optional.
        - Validation errors are raised as `ValidationError` exceptions,
        providing detailed error messages
          indicating the specific validation failures.
    """

    title = fields.String(required=True)
    topics = fields.List(fields.String())
    specific_topics = fields.String()
    instructions_for_ai = fields.String()
    types_of_questions = fields.Mapping(
        keys=fields.String(),
        values=fields.List(fields.Integer()),
    )


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


@assignment_blueprint.route("/api/<hub_id>/generate-assignment", methods=["POST"])
@limiter.limit("5 per minute")
@firebase_token_required
def generate_assignment(hub_id):
    """
    Generate an assignment for a given hub.

    This endpoint generates an assignment for the specified hub
    based on the provided parameters.
    It first validates the input data using the GenerateAssignmentSchema
    schema. Then, it retrieves
    the hub data from the database using the provided hub ID and checks
    if the hub exists. If the hub
    exists, it determines the number of existing assignments in the hub
    to calculate the count of the
    new assignment. Finally, it asynchronously processes the assignment
    generation task using Celery.

    Args:
        hub_id (str): The ID of the hub for which the assignment is generated.

    Returns:
        tuple: A tuple containing the JSON response and HTTP status code.

    Raises:
        Exception: If an error occurs during assignment generation or validation.

    """
    try:
        schema = GenerateAssignmentSchema()
        data = schema.load(request.get_json())

        title = data.get("title")
        topics = data.get("topics")
        specific_topics = data.get("specific_topics")
        instructions_for_ai = data.get("instructions_for_ai")
        types_of_questions = data.get("types_of_questions")

        hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)
        print(hub_object_id)
        hub_data = Hub.objects(id=hub_object_id).first()
        print(hub_data)

        if not hub_data:
            return (
                jsonify({"error": "Hub not found", "success": False}),
                StatusCode.NOT_FOUND.value,
            )

        assignments_count = len(hub_data.assignments)
        print(assignments_count)

        process_assignment_generation.apply_async(
            args=[
                title,
                topics,
                specific_topics,
                instructions_for_ai,
                types_of_questions,
                hub_id,
                assignments_count,
            ],
            retry_policy={
                "max_retries": 3,
                "interval_start": 2,
                "interval_step": 2,
                "interval_max": 10,
            },
        )

        return (
            jsonify({"message": "Generating the assignment", "success": True}),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )
