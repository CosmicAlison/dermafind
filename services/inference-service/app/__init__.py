from flask import Flask
from .extensions import db, migrate
from config import config
import os


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from .scan import scan_bp
    from .recommendation import recommendation_bp

    app.register_blueprint(scan_bp,            url_prefix='/api/inference/scan')
    app.register_blueprint(recommendation_bp,  url_prefix='/api/inference/recommendation')

    return app
