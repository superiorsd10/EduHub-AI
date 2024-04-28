"""
Assignment routes for the Flask application.
"""

import base64
import uuid
from bson import ObjectId
from flask import Blueprint, request, jsonify
from app.auth.firebase_auth import firebase_token_required
from app.enums import StatusCode
from app.core import limiter
from app.models.hub import Hub
from app.models.assignment import Assignment
from app.celery.tasks.assignment_tasks import (
    process_assignment_generation,
    process_assignment_changes,
    process_create_assignment_using_ai,
    process_create_assignment_manually,
)
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
    types_of_questions = fields.Dict(
        keys=fields.String(),
        values=fields.List(fields.Integer()),
    )


class MakeChangesToAssignmentSchema(Schema):
    """
    Schema for validating and parsing data for making changes to an assignment.

    This schema defines the structure of data expected when making changes to an assignment.
    It includes fields for the prompt describing the changes to be made and the
    desired difficulty level of the assignment.

    Attributes:
        changes_prompt (fields.String): A required field for providing a prompt describing
        the changes to be made to the assignment.
        assignment_difficulty (fields.String): A required field for specifying the desired
        difficulty level of the assignment.

    """

    changes_prompt = fields.String(required=True)
    assignment_difficulty = fields.String(required=True)


class CreateAssignmentUsingAISchema(Schema):
    """
    Schema for validating data when creating an assignment using AI.

    Attributes:
        hub_id (str): The ID of the hub where the assignment is created.
        title (str): The title of the assignment.
        instructions (str, optional): Instructions for the assignment.
        total_points (int, optional): Total points for the assignment.
        question_points (list of int, optional): List of points for each question.
        due_datetime (datetime, optional): Due date and time for the assignment.
        topic (str, optional): Topic of the assignment.
        automatic_grading_enabled (bool, optional): Flag indicating if automatic grading is enabled.
        automatic_feedback_enabled (bool, optional): Flag indicating if automatic feedback is
        enabled.
        plagiarism_checker_enabled (bool, optional): Flag indicating if plagiarism checker is
        enabled.
    """

    title = fields.String(required=True)
    instructions = fields.String()
    total_points = fields.Integer()
    question_points = fields.List(fields.Integer())
    due_datetime = fields.DateTime()
    topic = fields.String()
    automatic_grading_enabled = fields.Boolean()
    automatic_feedback_enabled = fields.Boolean()
    plagiarism_checker_enabled = fields.Boolean()


class CreateAssignmentManuallySchema(Schema):
    """
    Schema for validating and deserializing data when creating an assignment manually.

    Attributes:
        title (str): The title of the assignment. Required.
        instructions (str, optional): Instructions for the assignment.
        total_points (int, optional): Total points for the assignment.
        question_points (List[int], optional): List of points for each question.
        due_datetime (datetime, optional): Due date and time for the assignment.
        topic (str, optional): Topic of the assignment.
        questions (str, optional): The questions for the assignment.
        answers (str, optional): The answers to the questions.
        automatic_grading_enabled (bool, optional): Indicates if automatic grading is enabled.
        automatic_feedback_enabled (bool, optional): Indicates if automatic feedback is enabled.
        plagiarism_checker_enabled (bool, optional): Indicates if plagiarism checker is enabled.

    Raises:
        ValidationError: If validation fails for any of the attributes.

    """

    title = fields.String(required=True)
    instructions = fields.String()
    total_points = fields.Integer()
    question_points = fields.List(fields.Integer())
    due_datetime = fields.DateTime()
    topic = fields.String()
    questions = fields.Dict(
        keys=fields.String(),
        values=fields.String(),
    )
    answers = fields.Dict(
        keys=fields.String(),
        values=fields.String(),
    )
    automatic_grading_enabled = fields.Boolean()
    automatic_feedback_enabled = fields.Boolean()
    plagiarism_checker_enabled = fields.Boolean()


class SubmitAssignmentSchema(Schema):
    """Schema for validating submission of an assignment response.

    Attributes:
        response (fields.String): A string field representing the response to the assignment,
            required for submission.
    """

    response = fields.String(required=True)


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
        hub_data = Hub.objects(id=hub_object_id).first()

        if not hub_data:
            return (
                jsonify({"error": "Hub not found", "success": False}),
                StatusCode.NOT_FOUND.value,
            )

        assignments_count = len(hub_data.assignments)
        generate_assigment_id = str(uuid.uuid4())

        process_assignment_generation.apply_async(
            args=[
                title,
                topics,
                specific_topics,
                instructions_for_ai,
                types_of_questions,
                generate_assigment_id,
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
            jsonify(
                {
                    "message": f"Generate Assignment ID: {generate_assigment_id}",
                    "success": True,
                }
            ),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@assignment_blueprint.route(
    "/api/make-changes-to-assignment/<generate_assignment_id>", methods=["POST"]
)
@limiter.limit("5 per minute")
@firebase_token_required
def make_changes_to_assignment(generate_assignment_id):
    """
    Route to initiate changes to an existing assignment generated by the Meta-Llama model.

    This endpoint receives a POST request containing the changes prompt and desired difficulty level
    for modifying the assignment associated with the given generate_assignment_id.
    It validates the input using the MakeChangesToAssignmentSchema schema and
    asynchronously processes the assignment changes using the process_assignment_changes
    Celery task.

    Args:
        generate_assignment_id (str): The unique identifier of the assignment to be modified.

    Returns:
        tuple: A tuple containing JSON response with a message indicating the success of the
            operation and the corresponding HTTP status code.

    """
    try:
        schema = MakeChangesToAssignmentSchema()
        data = schema.load(request.get_json())

        changes_prompt = data.get("changes_prompt")
        assignment_difficulty = data.get("assignment_difficulty")

        process_assignment_changes.apply_async(
            args=[
                generate_assignment_id,
                changes_prompt,
                assignment_difficulty,
            ],
            retry_policy={
                "max_retries": 3,
                "interval_start": 2,
                "interval_step": 2,
                "interval_max": 10,
            },
        )

        return (
            jsonify(
                {
                    "message": "Assignment modification in process",
                    "success": True,
                }
            ),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@assignment_blueprint.route(
    "/api/<hub_id>/create-assignment-using-ai/<generate_assignment_id>",
    methods=["POST"],
)
@limiter.limit("5 per minute")
@firebase_token_required
def create_assignment_using_ai(hub_id, generate_assignment_id):
    """
    Create Assignment Using AI.

    This endpoint creates an assignment using AI-assisted generation.
    The function receives POST requests containing assignment data in JSON format
    and processes them asynchronously.

    Args:
        generate_assignment_id (str): The unique identifier for generating the assignment.

    Returns:
        tuple: A tuple containing JSON response and HTTP status code.
            The JSON response contains a message indicating whether the assignment creation
            is in process and its success status.
            The HTTP status code indicates the success or failure of the request.

    Raises:
        StatusCode.INTERNAL_SERVER_ERROR: If an unexpected error occurs during assignment creation.

    """
    try:
        schema = CreateAssignmentUsingAISchema()
        data = schema.load(request.get_json())

        title = data.get("title")
        instructions = data.get("instructions")
        total_points = data.get("total_points")
        question_points = data.get("question_points")
        due_datetime = data.get("due_datetime")
        topic = data.get("topic")
        automatic_grading_enabled = data.get("automatic_grading_enabled")
        automatic_feedback_enabled = data.get("automatic_feedback_enabled")
        plagiarism_checker_enabled = data.get("plagiarism_checker_enabled")

        process_create_assignment_using_ai.apply_async(
            args=[
                generate_assignment_id,
                hub_id,
                title,
                instructions,
                total_points,
                question_points,
                due_datetime,
                topic,
                automatic_grading_enabled,
                automatic_feedback_enabled,
                plagiarism_checker_enabled,
            ],
            retry_policy={
                "max_retries": 3,
                "interval_start": 2,
                "interval_step": 2,
                "interval_max": 10,
            },
        )

        return (
            jsonify(
                {
                    "message": "Assignment creation in process",
                    "success": True,
                }
            ),
            StatusCode.SUCCESS.value,
        )
    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@assignment_blueprint.route(
    "/api/<hub_id>/create-assignment-manually", methods=["POST"]
)
@limiter.limit("5 per minute")
@firebase_token_required
def create_assignment_manually(hub_id):
    """
    Create Assignment Manually.

    This endpoint creates an assignment manually based on the provided data.
    The function receives POST requests containing assignment details in JSON format
    and processes them asynchronously.

    Args:
        hub_id (str): The ID of the hub to which the assignment belongs.

    Returns:
        tuple: A tuple containing JSON response and HTTP status code.
            The JSON response contains a message indicating whether the assignment creation
            is in process and its success status.
            The HTTP status code indicates the success or failure of the request.

    Raises:
        StatusCode.INTERNAL_SERVER_ERROR: If an unexpected error occurs during assignment creation.

    """
    try:
        schema = CreateAssignmentManuallySchema()
        data = schema.load(request.get_json())

        title = data.get("title")
        instructions = data.get("instructions")
        total_points = data.get("total_points")
        question_points = data.get("question_points")
        due_datetime = data.get("due_datetime")
        topic = data.get("topic")
        questions = data.get("questions")
        answers = data.get("answers")
        automatic_grading_enabled = data.get("automatic_grading_enabled")
        automatic_feedback_enabled = data.get("automatic_feedback_enabled")
        plagiarism_checker_enabled = data.get("plagiarism_checker_enabled")

        process_create_assignment_manually.apply_async(
            args=[
                hub_id,
                title,
                instructions,
                total_points,
                question_points,
                due_datetime,
                topic,
                questions,
                answers,
                automatic_grading_enabled,
                automatic_feedback_enabled,
                plagiarism_checker_enabled,
            ],
            retry_policy={
                "max_retries": 3,
                "interval_start": 2,
                "interval_step": 2,
                "interval_max": 10,
            },
        )

        return (
            jsonify(
                {
                    "message": "Assignment creation in process",
                    "success": True,
                }
            ),
            StatusCode.SUCCESS.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )


@assignment_blueprint.route(
    "/api/<hub_id>/get-assignment/<assignment_uuid>", methods=["GET"]
)
@limiter.limit("5 per minute")
@firebase_token_required
def get_assignment(hub_id, assignment_uuid):
    """
    Get Assignment.

    This endpoint retrieves the assignment corresponding to the provided hub ID and assignment UUID.
    It also checks the authorization of the requesting user based on their email and role in hub.

    Args:
        hub_id (str): The ID of the hub to which the assignment belongs.
        assignment_uuid (str): The UUID of the assignment to retrieve.

    Returns:
        tuple: A tuple containing JSON response and HTTP status code.
            The JSON response contains the retrieved assignment or an error message,
            depending on the outcome of the request.
            The HTTP status code indicates the success or failure of the request.

    Raises:
        StatusCode.NOT_FOUND: If the assignment or user is not found.
        StatusCode.INTERNAL_SERVER_ERROR: If an unexpected error occurs during the process.

    """
    try:
        email = request.args.get("email")
        hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)

        pipeline = [
            {"$match": {"_id": hub_object_id}},
            {
                "$addFields": {
                    "member_position": {
                        "$map": {
                            "input": {"$objectToArray": "$members_id"},
                            "as": "member",
                            "in": {
                                "key": "$$member.k",
                                "value": {
                                    "$map": {
                                        "input": "$$member.v",
                                        "as": "member_email",
                                        "in": {
                                            "$cond": [
                                                {"$eq": ["$$member_email", email]},
                                                {
                                                    "$indexOfArray": [
                                                        "$$member.v",
                                                        "$$member_email",
                                                    ]
                                                },
                                                -1,
                                            ]
                                        },
                                    },
                                    "member_index": {
                                        "$indexOfArray": ["$$member.v", email]
                                    },
                                },
                            },
                        }
                    }
                }
            },
            {
                "$unwind": {
                    "path": "$assignments",
                    "preserveNullAndEmptyArrays": True,
                }
            },
            {
                "$match": {
                    "assignments.uuid": assignment_uuid,
                }
            },
            {
                "$replaceRoot": {
                    "newRoot": {
                        "assignment": "$assignments",
                        "member_position": "$member_position",
                    }
                }
            },
        ]

        results = list(Hub.objects.aggregate(pipeline))

        if results:
            result = results[0]
            assignment = result["assignment"]
            member_position = result["member_position"][0]

            if not member_position:
                return (
                    jsonify({"error": "User not found", "success": False}),
                    StatusCode.NOT_FOUND.value,
                )

            member_role = member_position["key"]
            member_index = member_position["value"]

            if member_role in ("teacher", "teaching_assistant"):
                assignment_ids = assignment.assignment_ids
                assignments = Assignment.objects(id__in=assignment_ids)

                return (
                    jsonify(
                        {
                            "message": jsonify(
                                [assignment.to_mongo() for assignment in assignments]
                            ),
                            "success": True,
                        }
                    ),
                    StatusCode.SUCCESS.value,
                )

            if member_role == "student":
                predicted_difficulty_level = assignment.predicted_difficulty_level
                difficulty_level = predicted_difficulty_level[member_index]
                difficulty_mapping = {
                    "easy": 0,
                    "medium": 1,
                    "hard": 2,
                }
                assignment_id = assignment_ids[difficulty_mapping[difficulty_level]]
                retrieved_assignment = (
                    Assignment.objects(id=assignment_id).first().to_mongo()
                )

                if retrieved_assignment:
                    return (
                        jsonify(
                            {
                                "message": jsonify(retrieved_assignment),
                                "success": True,
                            }
                        ),
                        StatusCode.SUCCESS.value,
                    )

                return (
                    jsonify({"error": "Assignment not found", "success": False}),
                    StatusCode.NOT_FOUND.value,
                )

            return (
                jsonify({"error": "User not found", "success": False}),
                StatusCode.NOT_FOUND.value,
            )

        return (
            jsonify({"error": "Hub not found", "success": False}),
            StatusCode.NOT_FOUND.value,
        )

    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )
