"""
Main script to run the Flask application.
"""

from app.app import create_app, socketio
from config.config import Config
from flask_jwt_extended import JWTManager
from app.routes.user_routes import user_blueprint
from app.routes.hub_routes import hub_blueprint
from app.routes.post_routes import post_blueprint
from app.routes.recording_routes import recording_blueprint
from app.routes.assignment_routes import assignment_blueprint
from app.sockets.hub_sockets import (
    handle_accept_request,
    handle_reject_request,
    handle_invite_sent,
)
from app.sockets.group_chat_sockets import (
    handle_join_hub,
    handle_leave_hub,
    handle_send_message,
)
from app.sockets.assignment_sockets import (
    generate_assignment,
)
from app.celery.tasks.post_tasks import process_uploaded_file
from app.celery.tasks.recording_tasks import (
    process_image_files,
    process_recording_webhook,
)
from app.celery.tasks.assignment_tasks import (
    process_assignment_generation,
    process_assignment_changes,
    process_create_assignment_using_ai,
    process_create_assignment_manually,
    process_automatic_grading_and_feedback,
    process_plagiarism_checker,
)


app, celery_instance = create_app(Config)

jwt = JWTManager(app)


app.register_blueprint(user_blueprint)
app.register_blueprint(hub_blueprint)
app.register_blueprint(post_blueprint)
app.register_blueprint(recording_blueprint)
app.register_blueprint(assignment_blueprint)

socketio.on_event("invite-sent", handle_invite_sent)
socketio.on_event("accept-request", handle_accept_request)
socketio.on_event("reject-request", handle_reject_request)
socketio.on_event("join-hub", handle_join_hub)
socketio.on_event("leave-hub", handle_leave_hub)
socketio.on_event("send-message", handle_send_message)
socketio.on_event("generate-assignment", generate_assignment)


celery_instance.register_task(process_uploaded_file)
celery_instance.register_task(process_image_files)
celery_instance.register_task(process_recording_webhook)
celery_instance.register_task(process_assignment_generation)
celery_instance.register_task(process_assignment_changes)
celery_instance.register_task(process_create_assignment_using_ai)
celery_instance.register_task(process_create_assignment_manually)
celery_instance.register_task(process_automatic_grading_and_feedback)
celery_instance.register_task(process_plagiarism_checker)


def redis_subscription_worker():
    """
    Worker function for subscribing to Redis pub/sub messages and emitting them via Socket.IO.

    This function subscribes to messages on channels matching the pattern "chat:*" using the provided Redis client.
    When a new message is received, it decodes the channel and data, extracts the hub ID, and emits the message
    to the appropriate Socket.IO room ("new-message") associated with the hub.

    Note:
        This function should be executed in a separate thread or process to enable concurrent subscription
        and message emission without blocking the main application.

    Raises:
        Exception: If an error occurs during the subscription process or when emitting messages via Socket.IO.

    Returns:
        None
    """
    try:
        redis_client = Config.REDIS_CLIENT
        pubsub = redis_client.pubsub()
        pubsub.psubscribe("chat:*", "generate_assignment_hub_id_*")

        for message in pubsub.listen():
            if message["type"] == "pmessage":
                channel = message["channel"].decode("utf-8")
                data = message["data"].decode("utf-8")

                if channel.startswith("chat:"):
                    hub_id = channel.split(":")[1]
                    socketio.emit("new-message", data, room=hub_id)

                elif channel.startswith("generate_assignment_hub_id_"):
                    hub_id = channel.split("_")[4]
                    socketio.emit("generated-assignment", data, room=hub_id)

    except Exception as error:
        print(f"An error occurred in redis_subscription_worker: {error}")


if __name__ == "__main__":
    from threading import Thread

    worker_thread = Thread(target=redis_subscription_worker)
    worker_thread.daemon = True
    worker_thread.start()
    socketio.run(app, debug=True)
