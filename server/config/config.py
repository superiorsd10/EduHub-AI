"""
Configuration settings for the Flask application.
"""

import os
import redis
from dotenv import load_dotenv

load_dotenv()


class Config:
    """
    Base configuration class for the application.

    Attributes:
    - DEBUG: bool
    - TESTING: bool
    - MONGODB_SETTINGS: dict
    - JWT_SECRET_KEY: str
    - FIREBASE_CREDENTIALS: str
    """

    DEBUG = True
    TESTING = True
    MONGODB_SETTINGS = {
        "db": os.environ.get("MONGO_DB"),
        "host": os.environ.get("MONGO_URI"),
        "username": os.environ.get("MONGO_USERNAME"),
        "password": os.environ.get("MONGO_PASSWORD"),
        "alias": "default",
    }
    REDIS_URL = os.environ.get("REDIS_URL")
    REDIS_CLIENT = redis.from_url(REDIS_URL)
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    FIREBASE_CREDENTIALS = os.environ.get("FIREBASE_CREDENTIALS")
    SECRET_KEY = os.getenv("CRYPTO_SECRET_KEY")
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    SESSION_TYPE = os.getenv("SESSION_TYPE")


class TestConfig:
    """
    Configuration class for testing purposes.

    Attributes:
    - DEBUG: bool
    - TESTING: bool
    - MONGODB_SETTINGS: dict
    - JWT_SECRET_KEY: str
    - FIREBASE_CREDENTIALS: str
    """

    DEBUG = True
    TESTING = True
    MONGODB_SETTINGS = {
        "db": os.environ.get("MONGO_TEST_DB"),
        "host": os.environ.get("MONGO_TEST_URI"),
        "username": os.environ.get("MONGO_USERNAME"),
        "password": os.environ.get("MONGO_PASSWORD"),
        "alias": "default",
    }
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    FIREBASE_CREDENTIALS = os.environ.get("FIREBASE_CREDENTIALS")
