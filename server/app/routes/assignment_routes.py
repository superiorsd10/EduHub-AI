"""
Assignment routes for the Flask application.
"""

import base64
from bson import ObjectId
from flask import Blueprint
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
