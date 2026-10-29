from flask import request, jsonify, current_app
from . import recommendation_bp
from .service import generate_recommendation, get_last_recommendation
from ..models import Scan


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

    scan_data = request.get_json(silent=True) or {}
    scan_id = scan_data.get('scan_id')
    if not isinstance(scan_id, int) or isinstance(scan_id, bool):
        return jsonify({'error': 'Integer scan_id required'}), 400
    scan = Scan.query.filter_by(id=scan_id, user_id=user_id).first()
    if scan is None:
        return jsonify({'error': 'Scan not found'}), 404

    try:
        rec = generate_recommendation(scan, user_id)
        return jsonify(rec.to_dict()), 200
    except Exception as e:
        current_app.logger.error(f'Recommendation error: {e}')
        return jsonify({'error': 'Recommendation failed'}), 500