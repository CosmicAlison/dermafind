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

        # normalize Roboflow predictions into the box format your frontend expects
        boxes = [
            {
                'x':     pred['x'] / pred['image_width']  if 'image_width'  in pred else pred['x'],
                'y':     pred['y'] / pred['image_height'] if 'image_height' in pred else pred['y'],
                'w':     pred['width']  / pred.get('image_width',  1),
                'h':     pred['height'] / pred.get('image_height', 1),
                'label': pred['class'],
                'conf':  pred['confidence'],
            }
            for pred in scan._predictions
        ]

        return jsonify({**scan.to_dict(), 'boxes': boxes}), 201

    except Exception as e:
        current_app.logger.error(f'Detection error: {e}')
        return jsonify({'error': 'Detection failed'}), 500
    
@scan_bp.get('/<int:scan_id>')
def get_scan(scan_id: int):
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    scan = Scan.query.filter_by(id=scan_id, user_id=user_id).first()
    if not scan:
        return jsonify({'error': 'Scan not found'}), 404

    return jsonify(scan.to_dict()), 200
