"""
This module defines the Flask application for the project.
"""

import os
from flask import Flask
from mongoengine import connect
from config.config import Config
from firebase_admin import credentials, initialize_app
from dotenv import load_dotenv
from flask_redis import FlaskRedis
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


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

    redis = FlaskRedis(app)

    print(redis.config_prefix)

    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["1000 per day", "100 per hour"],
        storage_uri=app.config["REDIS_URL"],
    )

    print(limiter.current_limit)

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

    return app
