from flask import Blueprint

recommendation_bp = Blueprint('recommendation', __name__)

from . import routes
