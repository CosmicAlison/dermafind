from flask import request, jsonify, current_app
from . import recommendation_bp
from .service import generate_recommendation, get_last_recommendation


def get_user_id():
    return request.headers.get('X-User-Id')


@recommendation_bp.get('/')
def get_recommendation():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    rec = get_last_recommendation(user_id)
    if not rec:
        return jsonify({'error': 'No recommendation found'}), 404

    return jsonify(rec.to_dict()), 200


@recommendation_bp.post('/')
def create_recommendation():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    scan_data = request.get_json()
    if not scan_data:
        return jsonify({'error': 'Scan data required'}), 400

    api_key = current_app.config['ANTHROPIC_API_KEY']
    if not api_key:
        return jsonify({'error': 'Anthropic API key not configured'}), 500

    try:
        rec = generate_recommendation(scan_data, user_id, api_key)
        return jsonify(rec.to_dict()), 200
    except Exception as e:
        current_app.logger.error(f'Recommendation error: {e}')
        return jsonify({'error': 'Recommendation failed'}), 500