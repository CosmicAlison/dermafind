import os
from datetime import datetime, timezone, timedelta

from ..models import Recommendation, Scan
from ..extensions import db
import requests
from flask import current_app
import re
import json


def load_prompt() -> str:
    prompt_path = os.path.join(os.path.dirname(__file__), '..', '..', 'prompt.txt')
    with open(prompt_path, 'r') as f:
        return f.read()


def get_last_recommendation(user_id: str) -> Recommendation | None:
    return (
        Recommendation.query
        .filter_by(user_id=user_id)
        .order_by(Recommendation.created_at.desc())
        .first()
    )


def is_within_one_week(rec: Recommendation) -> bool:
    now      = datetime.now(timezone.utc)
    rec_time = rec.created_at.replace(tzinfo=timezone.utc) if rec.created_at.tzinfo is None else rec.created_at
    return (now - rec_time) < timedelta(weeks=1)


def build_scan_summary(scan: Scan) -> str:
    grade_labels = {0: 'Clear', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Very Severe'}
    return (
        f"Severity grade: {scan.result} ({grade_labels.get(scan.result, 'Unknown')})\n"
        f"Blackheads: {scan.blackhead}\n"
        f"Dark spots: {scan.darkspot}\n"
        f"Papules: {scan.papule}\n"
        f"Pustules: {scan.pustule}\n"
        f"Whiteheads: {scan.whitehead}\n"
        f"Nodules: {scan.nodule}\n"
    )


def generate_recommendation(scan: Scan, user_id: str) -> Recommendation:
    # Rate limit — return last recommendation if within one week
    last = get_last_recommendation(user_id)
    if last and is_within_one_week(last):
        return last

    api_key = current_app.config['OPENROUTER_API_KEY']
    prompt_template = load_prompt()
    scan_summary    = build_scan_summary(scan)
    full_prompt     = prompt_template.replace('{{SCAN_RESULTS}}', scan_summary)

    res = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'openrouter/free',
                'messages': [{'role': 'user', 'content': full_prompt}],
            },
            timeout=30,
        )
    res.raise_for_status()
    content =  res.json()['choices'][0]['message']['content']
    clean = re.sub(r"```json|```", "", content).strip()

    data = json.loads(clean)

    recommendation = data["recommendation"]
    rec = Recommendation(
        user_id = user_id,
        content = recommendation,
    )
    db.session.add(rec)
    db.session.commit()
    return rec
