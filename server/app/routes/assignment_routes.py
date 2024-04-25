"""
Assignment routes for the Flask application.
"""

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
