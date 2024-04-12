"""
Main script to run the Flask application.
"""

from app.app import create_app, socketio
from config.config import Config
from flask_jwt_extended import JWTManager
from app.routes.user_routes import user_blueprint
from app.routes.hub_routes import hub_blueprint
from app.routes.post_routes import post_blueprint
from app.sockets.hub_sockets import (
    handle_accept_request,
    handle_reject_request,
    handle_invite_sent,
)
from app.celery.tasks.post_tasks import process_uploaded_file


app, celery_instance = create_app(Config)

jwt = JWTManager(app)


app.register_blueprint(user_blueprint)
app.register_blueprint(hub_blueprint)
app.register_blueprint(post_blueprint)

socketio.on_event("invite-sent", handle_invite_sent)
socketio.on_event("accept-request", handle_accept_request)
socketio.on_event("reject-request", handle_reject_request)

celery_instance.register_task(process_uploaded_file)

if __name__ == "__main__":
    socketio.run(app, debug=True)
