import os

class Config:
    DEBUG = True
    TESTING = True
    MONGODB_SETTINGS = {
        "db": os.environ.get("MONGO_DB"),
        "host": os.environ.get("MONGO_URI"), 
        "username": os.environ.get("MONGO_USERNAME"),
        "password": os.environ.get("MONGO_PASSWORD"),
    }
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    FIREBASE_CREDENTIALS = os.environ.get("FIREBASE_CREDENTIALS")