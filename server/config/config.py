"""
Configuration settings for the Flask application.
"""

import os
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
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    FIREBASE_CREDENTIALS = os.environ.get("FIREBASE_CREDENTIALS")
    REDIS_URL = os.environ.get("REDIS_URL")
    REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD")
    REDIS_PORT = os.environ.get("REDIS_PORT")


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
    REDIS_URL = os.environ.get("REDIS_URL")
    REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD")
    REDIS_PORT = os.environ.get("REDIS_PORT")
