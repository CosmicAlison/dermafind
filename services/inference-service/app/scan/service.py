import base64
import io
import os
import requests
from inference_sdk import InferenceHTTPClient
from inference_sdk import InferenceConfiguration

from flask import current_app
from ..models import Scan
from ..extensions import db
from ..tasks import generate_recommendation_task

# ── Severity table (ported from Node.js) ─────────────────────────────────────
SEVERITY = [
    {'grade': 0, 'lesions':  5, 'inflammatory':  0, 'nodes': 0},
    {'grade': 1, 'lesions': 10, 'inflammatory':  1, 'nodes': 0},
    {'grade': 2, 'lesions': 20, 'inflammatory':  8, 'nodes': 0},
    {'grade': 3, 'lesions': 30, 'inflammatory': 15, 'nodes': 1},
    {'grade': 4, 'lesions': 50, 'inflammatory': 20, 'nodes': 5},
]

CLASS_MAPPING = {
    '0' :  'pustule',
    '1' :  'darkspot',
    '2':     'nodule',
    '3':    'papule',
    '4':  'whitehead',
    '5':     'blackhead',
}


def classify_severity(lesions: int, inflammatory: int, nodes: int) -> int:
    score = 0
    for level in SEVERITY:
        if lesions >= level['lesions'] or inflammatory >= level['inflammatory'] or nodes >= level['nodes']:
            score = level['grade']
    return score


def call_roboflow(image_bytes: bytes, api_key: str):
    image_b64 = base64.b64encode(image_bytes).decode('utf-8')

    CLIENT = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com", 
        api_key=api_key
    )

    configuration = InferenceConfiguration(
    confidence_threshold=0.1
    )
    CLIENT.configure(configuration)

    response = CLIENT.infer(image_b64, "acne-zqozl/3")

    return response.get('predictions', []), response.get('image', {})

    


def run_detection(image_bytes: bytes, user_id: str, api_key: str) -> Scan:
    predictions, image_meta = call_roboflow(image_bytes, api_key)

    lesion_counts = {k: 0 for k in set(CLASS_MAPPING.values())}
    for pred in predictions:
        mapped = CLASS_MAPPING.get(pred['class'])
        if mapped:
            lesion_counts[mapped] += 1
            pred['class'] = mapped  

    total_lesions = sum(lesion_counts.values())
    inflammatory  = lesion_counts['papule'] + lesion_counts['pustule']
    score         = classify_severity(total_lesions, inflammatory, lesion_counts['nodule'])

    scan = Scan(
        user_id = user_id,
        result  = score,
        **lesion_counts,
    )
    db.session.add(scan)
    db.session.commit()
    
    generate_recommendation_task.delay(scan.id, user_id)
    scan._predictions = predictions
    img_w = image_meta.get('width', 1)
    img_h = image_meta.get('height', 1)
    scan._predictions = predictions
    scan._image_meta  = image_meta
    return scan