#!/bin/sh

echo "Initializing database..."
python init_db.py

echo "Starting server..."
gunicorn --bind 0.0.0.0:8083 --workers 2 run:app