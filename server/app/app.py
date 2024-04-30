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
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_session import Session
import boto3
from app.celery.celery import celery_instance, init_celery
import google.generativeai as genai
import redis

socketio = SocketIO()
sess = Session()


def create_app(config=None):
    """
    Create and configure the Flask app.

    :param config: Optional configuration object.
    :return: The configured Flask app.
    """
    app = Flask(__name__)

    CORS(app)

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

    sess.init_app(app)

    socketio.init_app(app, cors_allowed_origins="*")

    app.config["S3_CLIENT"] = boto3.client(
        "s3",
        region_name="ap-south-1",
        aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY,
    )

    app.redis_client = redis.from_url(Config.REDIS_URL)

    init_celery(app)

    genai.configure(api_key=Config.GOOGLE_API_KEY)

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

    return app, celery_instance


def create_test_app():
    """
    Create a test instance of the Flask app.

    :return: The test Flask app.
    """
    app = Flask(__name__)

    app.config.from_object(TestConfig)

    return app
