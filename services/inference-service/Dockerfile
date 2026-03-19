FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8083

CMD ["gunicorn", "--bind", "0.0.0.0:8083", "--workers", "2", "run:app"]
