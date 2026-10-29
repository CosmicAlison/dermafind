"""Retrieve approved medical reference excerpts; never store patient scans."""
import requests
from flask import current_app
from sqlalchemy import text
from ..extensions import db

def embed(value):
    key = current_app.config.get("OPENROUTER_API_KEY")
    if not key:
        raise RuntimeError("Missing embedding API key")
    response = requests.post("https://openrouter.ai/api/v1/embeddings",
        headers={"Authorization": f"Bearer {key}"},
        json={"model": current_app.config.get("RAG_EMBEDDING_MODEL", "openai/text-embedding-3-small"), "input": value}, timeout=20)
    response.raise_for_status()
    vector = response.json()["data"][0]["embedding"]
    if len(vector) != 1536:
        raise ValueError("Embedding dimension mismatch")
    return vector

def retrieve(query, limit=4):
    vector = "[" + ",".join(map(str, embed(query))) + "]"
    rows = db.session.execute(text("""
        SELECT source_id, title, source_url, content,
               embedding <=> CAST(:vector AS vector) AS distance
        FROM dermatology_chunks WHERE published = true
        ORDER BY embedding <=> CAST(:vector AS vector)
        LIMIT :limit
    """), {"vector": vector, "limit": min(max(int(limit), 1), 8)}).mappings().all()
    threshold = float(current_app.config.get("RAG_MAX_DISTANCE", 0.65))
    return [dict(row) for row in rows if row["distance"] <= threshold]

def format_context(sources):
    return "\n\n".join(
        f"[{i}] {source['title']} ({source['source_url']})\n{source['content']}"
        for i, source in enumerate(sources, 1))
