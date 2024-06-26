"""
Assignment routes for the Flask application.
"""

import base64
from datetime import datetime
import uuid
from bson import ObjectId
from flask import Blueprint, request, jsonify, current_app
from app.auth.firebase_auth import firebase_token_required
from app.enums import StatusCode
from app.core import limiter
from app.models.hub import Hub
from app.models.assignment import Assignment
from app.models.user import User, Assignment as UserEmbeddedAssignment
from app.celery.tasks.assignment_tasks import (
    process_assignment_generation,
    process_assignment_changes,
    process_create_assignment_using_ai,
    process_create_assignment_manually,
    process_automatic_grading_and_feedback,
    process_plagiarism_checker,
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
    topics = fields.String(required=True)
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
    due_datetime = fields.Integer()
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
    due_datetime = fields.Integer()
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


class AssessAssignmentManuallySchema(Schema):
    """
    Schema for manually assessing an assignment, including marks and feedback.

    Attributes:
        marks (dict): A dictionary representing the marks assigned to different criteria or sections of the assignment.
            The keys are strings representing the criteria or sections, and the values are floating-point numbers
            representing the marks awarded.
        feedbacks (dict): A dictionary representing the feedback provided for different
        criteria or sections of the assignment.
            The keys are strings representing the criteria or sections, and the values
            are strings containing the feedback comments.
        difficulty_level (str): A string representing the difficulty level of the assignment that
        is assessed.
    """

    marks = fields.Dict(
        keys=fields.String(),
        values=fields.Float(),
    )
    feedbacks = fields.Dict(
        keys=fields.String(),
        values=fields.String(),
    )
    difficulty_level = fields.String(required=True)


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


def calculate_seconds_difference(due_datetime: datetime) -> float:
    """
    Calculate the number of seconds difference between due datetime and current time.

    Args:
        due_datetime (datetime): The due datetime for the task.

    Returns:
        int: The number of seconds difference between due datetime and current time.
    """
    current_time = datetime.now()
    time_difference = current_time - due_datetime
    seconds_difference = time_difference.total_seconds()
    return float(seconds_difference)


@assignment_blueprint.route("/api/<hub_id>/generate-assignment", methods=["POST"])
@limiter.limit("5 per minute")
# @firebase_token_required
# @limiter.limit("5 per minute")
# firebase_token_required
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
# @limiter.limit("5 per minute")
# firebase_token_required
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
# @limiter.limit("5 per minute")
# firebase_token_required
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

        create_assignment_uuid = str(uuid.uuid4())

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
                create_assignment_uuid,
            ],
            retry_policy={
                "max_retries": 3,
                "interval_start": 2,
                "interval_step": 2,
                "interval_max": 10,
            },
        )

        due_datetime = datetime.fromtimestamp(due_datetime / 1000)
        total_seconds = calculate_seconds_difference(due_datetime)

        if automatic_grading_enabled and automatic_feedback_enabled:
            process_automatic_grading_and_feedback.apply_async(
                args=[
                    create_assignment_uuid,
                ],
                retry_policy={
                    "max_retries": 3,
                    "interval_start": 2,
                    "interval_step": 2,
                    "interval_max": 10,
                },
                countdown=total_seconds,
            )

        if plagiarism_checker_enabled:
            process_plagiarism_checker.apply_async(
                args=[
                    create_assignment_uuid,
                ],
                retry_policy={
                    "max_retries": 3,
                    "interval_start": 2,
                    "interval_step": 2,
                    "interval_max": 10,
                },
                countdown=total_seconds,
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

        create_assignment_uuid = str(uuid.uuid4())

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
                create_assignment_uuid,
            ],
            retry_policy={
                "max_retries": 3,
                "interval_start": 2,
                "interval_step": 2,
                "interval_max": 10,
            },
        )

        due_datetime = datetime.fromtimestamp(due_datetime / 1000)
        total_seconds = calculate_seconds_difference(due_datetime)

        if automatic_grading_enabled and automatic_feedback_enabled:
            process_automatic_grading_and_feedback.apply_async(
                args=[
                    create_assignment_uuid,
                ],
                retry_policy={
                    "max_retries": 3,
                    "interval_start": 2,
                    "interval_step": 2,
                    "interval_max": 10,
                },
                countdown=total_seconds,
            )

        if plagiarism_checker_enabled:
            process_plagiarism_checker.apply_async(
                args=[
                    create_assignment_uuid,
                ],
                retry_policy={
                    "max_retries": 3,
                    "interval_start": 2,
                    "interval_step": 2,
                    "interval_max": 10,
                },
                countdown=total_seconds,
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
# @limiter.limit("5 per minute")
# firebase_token_required
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
                "$project": {
                    "members_email": {"$objectToArray": "$members_email"},
                    "assignments": 1,
                }
            },
            {"$unwind": "$members_email"},
            {"$match": {"members_email.v": email}},
            {
                "$project": {
                    "member_role": "$members_email.k",
                    "member_index": {"$indexOfArray": ["$members_email.v", email]},
                    "assignments": 1,
                }
            },
            {"$unwind": "$assignments"},
            {"$match": {"assignments.uuid": assignment_uuid}},
            {
                "$project": {
                    "_id": 0,
                    "member_role": 1,
                    "member_index": 1,
                    "assignment": "$assignments",
                }
            },
        ]

        results = list(Hub.objects.aggregate(pipeline))

        if results:
            result = results[0]
            assignment = result["assignment"]
            member_role = result["member_role"]
            member_index = result["member_index"]
            assignment_ids = assignment.get("assignment_ids")

            if member_role in ("teacher", "teaching_assistant"):
                assignments = Assignment.objects(id__in=assignment_ids)

                assignments_list = []

                for assignment in assignments:
                    assignment_dict = assignment.to_mongo().to_dict()
                    assignment_dict["_id"] = str(assignment_dict["_id"])
                    assignment_dict["hub_id"] = str(assignment_dict["hub_id"])
                    assignments_list.append(assignment_dict)

                return (
                    jsonify(
                        {
                            "message": assignments_list,
                            "success": True,
                        }
                    ),
                    StatusCode.SUCCESS.value,
                )

            if member_role == "student":
                predicted_difficulty_level = assignment.get(
                    "predicted_difficulty_level"
                )
                difficulty_level = predicted_difficulty_level[member_index]
                difficulty_mapping = {
                    "easy": 0,
                    "medium": 1,
                    "hard": 2,
                }
                assignment_id = assignment_ids[difficulty_mapping[difficulty_level]]
                retrieved_assignment = (
                    Assignment.objects(id=assignment_id).first().to_mongo().to_dict()
                )

                retrieved_assignment["_id"] = str(retrieved_assignment["_id"])
                retrieved_assignment["hub_id"] = str(retrieved_assignment["hub_id"])

                if retrieved_assignment:
                    return (
                        jsonify(
                            {
                                "message": retrieved_assignment,
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


@assignment_blueprint.route("/api/submit-assignment/<assignment_id>", methods=["POST"])
# @limiter.limit("5 per minute")
# firebase_token_required
def submit_assignment(assignment_id):
    """Submit a response to an assignment.

    This endpoint allows users to submit their responses to a specific assignment.

    Args:
        assignment_id (str): The base64 encoded ID of the assignment.

    Returns:
        tuple: A tuple containing a JSON response indicating the status of the submission
        and a corresponding HTTP status code.

    Raises:
        Exception: If an error occurs during the submission process.
    """
    try:
        schema = SubmitAssignmentSchema()
        data = schema.load(request.get_json())
        email = request.args.get("email")
        response = data.get("response")

        redis_client = current_app.redis_client
        user_name_key = f"user_name_{email}"
        name = redis_client.get(user_name_key)
        assignment_marks_dict_key = f"{email}:{name}"

        assignment_object_id = decode_base64_to_objectid(base64_encoded=assignment_id)

        Assignment.objects(id=assignment_object_id).update_one(
            push__responses={assignment_marks_dict_key: response}
        )

        return (
            jsonify(
                {
                    "message": "Response submitted successfully",
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
    "/api/<hub_id>/assess-assignment-manually/<assignment_uuid>", methods=["POST"]
)
@limiter.limit("5 per minute")
@firebase_token_required
def assess_assignment_manually(hub_id, assignment_uuid):
    """
    Endpoint for manually assessing an assignment and updating the database.

    This endpoint handles the assessment of an assignment by updating the marks and feedback provided
    by the assessor. It also updates the assignment details in the database and assigns marks to the
    corresponding users' assignments.

    Args:
        hub_id (str): The ID of the hub associated with the assignment.
        assignment_uuid (str): The UUID of the assignment to be assessed.

    Returns:
        tuple: A tuple containing the JSON response and the HTTP status code.
            - If the assessment is successful, returns a JSON response indicating success along with
              the HTTP status code 200 (OK).
            - If there is an error during the assessment process, returns a JSON response containing
              the error message along with an appropriate HTTP status code indicating the error (e.g., 404
              for "Not Found" error or 500 for "Internal Server Error").
    """
    try:
        schema = AssessAssignmentManuallySchema()
        data = schema.load(request.get_json())

        hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)
        marks = data.get("marks")
        feedbacks = data.get("feedbacks")
        difficulty_level = data.get("difficulty_level")

        embedded_assignment = Hub.objects(
            id=hub_object_id, assignments__uuid=assignment_uuid
        ).first()

        if not embedded_assignment:
            return (
                jsonify({"error": "Assignment not found", "success": False}),
                StatusCode.NOT_FOUND.value,
            )

        embedded_assignment_dict = embedded_assignment.to_mongo().to_dict()
        assignment_ids = embedded_assignment_dict.get("assignment_ids")
        total_points = embedded_assignment_dict.get("total_points")

        if not assignment_ids:
            return (
                jsonify({"error": "Assignment not found", "success": False}),
                StatusCode.NOT_FOUND.value,
            )

        difficulty_mapping = {
            "easy": 0,
            "medium": 1,
            "hard": 2,
        }

        assignment_id = assignment_ids[difficulty_mapping[difficulty_level]]

        Assignment.objects(id=assignment_id).update_one(
            set__marks=marks,
            set__feedbacks=feedbacks,
            upsert=True,
        )

        for email, mark in marks.items():
            user_assignment = UserEmbeddedAssignment(
                assignment_id=assignment_id,
                marks=mark,
                maximum_marks=total_points,
            )

            User.objects(email=email).update_one(
                push__assignments=user_assignment,
            )

        hub = Hub.objects(id=hub_object_id).first()

        if not hub:
            return (
                jsonify({"error": "Hub not found", "success": False}),
                StatusCode.NOT_FOUND.value,
            )

        hub_dict = hub.to_mongo().to_dict()
        students_assignment_marks = hub_dict["students_assignment_marks"]

        for email, mark in marks.items():
            if email in students_assignment_marks:
                students_assignment_marks[email].append(marks)
            else:
                students_assignment_marks[email] = [marks]

        students_assignment_marks.setdefault("maximum_marks", []).append(total_points)

        Hub.objects(id=hub_object_id).update_one(
            set__students_assignment_marks=students_assignment_marks
        )

        return (
            jsonify(
                {
                    "message": "Assignment assessed successfully",
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
