"""
Module for initializing Celery with a Flask application.
"""

from celery import Celery
from flask import Flask

celery_instance = Celery(__name__)


def init_celery(app: Flask) -> None:
    """
    Initialize Celery with Flask application configuration.

    Args:
        app (Flask): The Flask application instance.

    Returns:
        None
    """
    celery_instance.conf.update(app.config)
