from celery import Celery
from app import create_app
from app.models import Scan
from app.recommendation.service import generate_recommendation

celery = Celery(
    "tasks",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

@celery.task
def generate_recommendation_task(scan_id, user_id):
    app = create_app()

    with app.app_context():
        scan = Scan.query.get(scan_id)
        generate_recommendation(scan, user_id)