import base64
import io
import os
import requests

from ..models import Scan
from ..extensions import db

# ── Severity table (ported from Node.js) ─────────────────────────────────────
SEVERITY = [
    {'grade': 0, 'lesions':  5, 'inflammatory':  0, 'nodes': 0},
    {'grade': 1, 'lesions': 10, 'inflammatory':  1, 'nodes': 0},
    {'grade': 2, 'lesions': 20, 'inflammatory':  8, 'nodes': 0},
    {'grade': 3, 'lesions': 30, 'inflammatory': 15, 'nodes': 1},
    {'grade': 4, 'lesions': 50, 'inflammatory': 20, 'nodes': 5},
]

CLASS_MAPPING = {
    'blackhead':  'blackheads',
    'dark spot':  'darkspots',
    'papule':     'papules',
    'pustule':    'pustules',
    'whitehead':  'whiteheads',
    'nodule':     'nodules',
}

# colour per lesion type for bounding boxes
CLASS_COLOURS = {
    'blackheads': '#FF4444',
    'darkspots':  '#FF8800',
    'papules':    '#FFDD00',
    'pustules':   '#FF44AA',
    'whiteheads': '#AAAAFF',
    'nodules':    '#AA00FF',
}


def classify_severity(lesions: int, inflammatory: int, nodes: int) -> int:
    score = 0
    for level in SEVERITY:
        if lesions >= level['lesions'] or inflammatory >= level['inflammatory'] or nodes >= level['nodes']:
            score = level['grade']
    return score


def call_roboflow(image_bytes: bytes, api_key: str) -> list:
    image_b64 = base64.b64encode(image_bytes).decode('utf-8')
    response = requests.post(
        'https://detect.roboflow.com/acne-zqozl/2',
        params={'api_key': api_key, 'confidence': '1'},
        data=image_b64,
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        timeout=15,
    )
    response.raise_for_status()
    return response.json().get('predictions', [])


def run_detection(image_bytes: bytes, user_id: str, api_key: str) -> Scan:
    predictions = call_roboflow(image_bytes, api_key)

    lesion_counts = {k: 0 for k in CLASS_MAPPING.values()}
    for pred in predictions:
        mapped = CLASS_MAPPING.get(pred['class'])
        if mapped:
            lesion_counts[mapped] += 1

    total_lesions = sum(lesion_counts.values())
    inflammatory  = lesion_counts['papules'] + lesion_counts['pustules']
    score         = classify_severity(total_lesions, inflammatory, lesion_counts['nodules'])

    scan = Scan(
        user_id = user_id,
        result  = score,
        **lesion_counts,
    )
    db.session.add(scan)
    db.session.commit()

    # attach predictions to the object so the route can return them
    # without storing them in the DB
    scan._predictions = predictions
    return scan
