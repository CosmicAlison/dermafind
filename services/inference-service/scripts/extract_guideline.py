"""Extract local PDF into unpublished, page-attributed review candidates."""
import argparse
import json
import re
from pathlib import Path
import fitz

URL = "https://www.guidelines.edf.one/uploads/attachments/cmkmicwv8yrsarwjrzxnr41db-euroguiderm-acne-guideline-long-version.pdf"

def extract(pdf, max_chars=1400):
    doc = fitz.open(pdf)
    results = []
    for i, page in enumerate(doc):
        text = re.sub(r"\s+", " ", page.get_text("text", sort=True)).strip()
        if len(text) < 80:
            continue
        sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z(])", text)
        chunks, current = [], ""
        for sentence in sentences:
            if current and len(current) + len(sentence) > max_chars:
                chunks.append(current.strip())
                current = ""
            if len(sentence) > max_chars:
                chunks.extend(sentence[j:j+max_chars] for j in range(0, len(sentence), max_chars))
            else:
                current += " " + sentence
        if current.strip():
            chunks.append(current.strip())
        for n, content in enumerate(chunks, 1):
            results.append({
                "source_id": f"euroguiderm-2025-p{i+1:03d}-c{n:02d}",
                "title": "EuroGuiDerm Acne Guideline (2025)",
                "source_url": URL, "pdf_page": i+1,
                "section": "REVIEW_REQUIRED", "content": content,
                "review_status": "pending", "approved": False,
                "notes": "Review page layout, tables, contraindications, and reuse rights."
            })
    return results

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("pdf")
    p.add_argument("--out", default="candidates.json")
    args = p.parse_args()
    candidates = extract(args.pdf)
    Path(args.out).write_text(json.dumps(candidates, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"{len(candidates)} unpublished candidates written")
