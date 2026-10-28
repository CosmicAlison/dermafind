"""Import reviewed, licensed excerpts; entries remain unpublished until approved."""
import json
import sys
from pathlib import Path
from urllib.parse import urlparse
from sqlalchemy import text
from app import create_app
from app.extensions import db
from app.rag.service import embed

def main(path):
    documents = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(documents, list):
        raise ValueError("Expected a JSON list")
    app = create_app()
    with app.app_context():
        for item in documents:
            content = item["content"].strip()
            if not content or len(content) > 4000:
                raise ValueError("Excerpt length must be 1–4000 characters")
            if urlparse(item["source_url"]).scheme != "https":
                raise ValueError("Source URL must use HTTPS")
            vector = "[" + ",".join(map(str, embed(content))) + "]"
            db.session.execute(text("""
                INSERT INTO dermatology_chunks (source_id,title,source_url,content,embedding)
                VALUES (:id,:title,:url,:content,CAST(:vector AS vector))
                ON CONFLICT (source_id) DO UPDATE SET
                  title=EXCLUDED.title, source_url=EXCLUDED.source_url,
                  content=EXCLUDED.content, embedding=EXCLUDED.embedding,
                  published=false
            """), {"id": item["source_id"], "title": item["title"],
                   "url": item["source_url"], "content": content, "vector": vector})
        db.session.commit()
    print(f"Imported {len(documents)} unpublished excerpts")

if __name__ == "__main__":
    main(sys.argv[1])
