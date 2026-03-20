from flask import request, jsonify, current_app
from . import scan_bp
from .service import run_detection
from ..models import Scan


def get_user_id():
    """Extract user id injected by the nginx gateway."""
    return request.headers.get('X-User-Id')


@scan_bp.post('/detect')
def detect():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_bytes = request.files['image'].read()
    api_key     = current_app.config['ROBOFLOW_API_KEY']

    if not api_key:
        return jsonify({'error': 'Roboflow API key not configured'}), 500

    try:
        scan = run_detection(image_bytes, user_id, api_key)

        img_w = getattr(scan, '_image_meta', {}).get('width', 1)
        img_h = getattr(scan, '_image_meta', {}).get('height', 1)
        # normalize Roboflow predictions into the box format your frontend expects
        boxes = [
            {
                'x':     pred['x'] / img_w,
                'y':     pred['y'] / img_h,
                'w':     pred['width']  / img_w,
                'h':     pred['height'] / img_h,
                'label': pred['class'],
                'conf':  pred['confidence'],
            }
            for pred in scan._predictions
        ]

        return jsonify({**scan.to_dict(), 'boxes': boxes}), 201

    except Exception as e:
        current_app.logger.error(f'Detection error: {e}')
        return jsonify({'error': 'Detection failed'}), 500
    
@scan_bp.get('/')
def get_scan():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    scans = (
        Scan.query
        .filter_by(user_id=user_id)
        .order_by(Scan.date.desc())
        .limit(5)
        .all()
    )

    return jsonify([s.to_dict() for s in scans]), 200
