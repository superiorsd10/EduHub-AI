"""
Main script to run the Flask application.
"""

from app.app import create_app
from config.config import Config
from flask_jwt_extended import JWTManager
from app.routes.user_routes import user_blueprint
from app.routes.hub_routes import hub_blueprint


app = create_app(Config)

jwt = JWTManager(app)


app.register_blueprint(user_blueprint)
app.register_blueprint(hub_blueprint)

if __name__ == "__main__":
    app.run(debug=True)
