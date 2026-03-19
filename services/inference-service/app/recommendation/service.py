import os
import anthropic
from datetime import datetime, timezone, timedelta

from ..models import Recommendation, Scan
from ..extensions import db


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
        f"Blackheads: {scan.blackheads}\n"
        f"Dark spots: {scan.darkspots}\n"
        f"Papules: {scan.papules}\n"
        f"Pustules: {scan.pustules}\n"
        f"Whiteheads: {scan.whiteheads}\n"
        f"Nodules: {scan.nodules}\n"
    )


def generate_recommendation(scan: Scan, user_id: str, api_key: str) -> Recommendation:
    # Rate limit — return last recommendation if within one week
    last = get_last_recommendation(user_id)
    if last and is_within_one_week(last):
        return last

    prompt_template = load_prompt()
    scan_summary    = build_scan_summary(scan)
    full_prompt     = prompt_template.replace('{{SCAN_RESULTS}}', scan_summary)

    client   = anthropic.Anthropic(api_key=api_key)
    message  = client.messages.create(
        model      = 'claude-opus-4-6',
        max_tokens = 1024,
        messages   = [{'role': 'user', 'content': full_prompt}],
    )
    content = message.content[0].text

    rec = Recommendation(
        user_id = user_id,
        scan_id = scan.id,
        content = content,
    )
    db.session.add(rec)
    db.session.commit()
    return rec
