from app import create_app
from flask import Flask
from mongoengine import connect
from flask_jwt_extended import JWTManager
from firebase_admin import *
from firebase_admin import credentials
from config.config import Config

app = create_app()

app.config.from_object(Config)

connect(
    db=app.config["MONGODB_SETTINGS"]["db"],
    host=app.config["MONGODB_SETTINGS"]["host"],
    username=app.config["MONGODB_SETTINGS"]["username"],
    password=app.config["MONGODB_SETTINGS"]["password"],
)

jwt = JWTManager(app)

if __name__ == "__main__":
    app.run(debug=True)
