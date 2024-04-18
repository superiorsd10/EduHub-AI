"""
Recording routes for the Flask application.
"""

from flask import Blueprint, request, jsonify
from app.enums import StatusCode

recording_blueprint = Blueprint("recording", __name__)


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
                print(transcription_data)

            return (
                jsonify({"message": "Webhook received successfully", "success": True}),
                StatusCode.SUCCESS.value,
            )

        return (
            jsonify({"error": "Invalid JSON data in request", "success": False}),
            StatusCode.BAD_REQUEST.value,
        )
    except Exception as error:
        return (
            jsonify({"error": str(error), "success": False}),
            StatusCode.INTERNAL_SERVER_ERROR.value,
        )
