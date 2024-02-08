"""
This module defines the Flask application for the project.
"""

import os
from flask import Flask
from mongoengine import connect
from config.config import Config, TestConfig
from firebase_admin import credentials, initialize_app
from dotenv import load_dotenv
from app.core import limiter


def create_app(config=None):
    """
    Create and configure the Flask app.

    :param config: Optional configuration object.
    :return: The configured Flask app.
    """
    app = Flask(__name__)

    load_dotenv()

    if config:
        app.config.from_object(config)
    else:
        app.config.from_object(Config)

    mongo_config = app.config.get("MONGODB_SETTINGS")

    current_dir = os.path.dirname(os.path.abspath(__file__))

    key_file_path = os.path.abspath(
        os.path.join(current_dir, "../credentials/service_account_key.json")
    )

    cred = credentials.Certificate(key_file_path)

    firebase_app = initialize_app(cred)

    print(firebase_app.name)

    limiter.init_app(app)

    try:
        connect(
            db=mongo_config["db"],
            host=mongo_config["host"],
            username=mongo_config["username"],
            password=mongo_config["password"],
        )
        print("Connected to MongoDB successfully!")
    except Exception as exception:
        print(f"Failed to connect to MongoDB: {exception}")

    return app


def create_test_app():
    """
    Create a test instance of the Flask app.

    :return: The test Flask app.
    """
    app = Flask(__name__)

    app.config.from_object(TestConfig)

    return app
