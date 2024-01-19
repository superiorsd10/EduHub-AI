from flask import Flask
from app import create_app

def test_app_creation():
    app = create_app()
    assert app is not None
    assert isinstance(app, Flask)