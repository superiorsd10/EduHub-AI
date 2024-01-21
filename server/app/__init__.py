import os
from flask import Flask
from mongoengine import connect
from config.config import Config
from firebase_admin import credentials, initialize_app
from dotenv import load_dotenv

def create_app(config=None):
    
    app = Flask(__name__)
    
    load_dotenv()
    
    if config:
        app.config.from_object(config)
    
    mongo_config = app.config.get("MONGODB_SETTINGS")
    
    # Assuming your test script is in the 'tests/auth' directory
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Navigate up to the 'server' directory and then go to 'credentials'
    key_file_path = os.path.abspath(
        os.path.join(current_dir, "../credentials/service_account_key.json")
    )

    cred = credentials.Certificate(key_file_path)

    # Initialize Firebase in the testing context
    firebase_app = initialize_app(cred)

    try:
        connect(
            db=mongo_config["db"],
            host=mongo_config["host"],
            username=mongo_config["username"],
            password=mongo_config["password"],
        )
        print("Connected to MongoDB successfully!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        
    return app

def create_test_app():
    
    app = Flask(__name__)
    
    return app