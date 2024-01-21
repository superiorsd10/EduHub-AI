from app import create_app
from flask_jwt_extended import JWTManager
from firebase_admin import *
from config.config import Config

app = create_app(Config)

jwt = JWTManager(app)

from app.routes.user_routes import user_blueprint

app.register_blueprint(user_blueprint)

if __name__ == "__main__":
    app.run(debug=True)
