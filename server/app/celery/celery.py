"""
Module for initializing Celery with a Flask application.
"""

import os
from celery import Celery
from flask import Flask
from dotenv import load_dotenv

load_dotenv()

celery_instance = Celery(
    __name__,
    broker=os.getenv("CELERY_BROKER_URL"),
    backend=os.getenv("CELERY_RESULT_BACKEND"),
    include=[
        "app.celery.tasks.post_tasks",
        "app.celery.tasks.recording_tasks",
        "app.celery.tasks.assignment_tasks",
    ],
)


def init_celery(app: Flask) -> None:
    """
    Initialize Celery with Flask application configuration.

    Args:
        app (Flask): The Flask application instance.

    Returns:
        None
    """
    celery_instance.conf.update(app.config)
    celery_instance.conf.broker_url = app.config["CELERY_BROKER_URL"]
    celery_instance.conf.result_backend = app.config["CELERY_RESULT_BACKEND"]
    celery_instance.redis_client = app.redis_client
