"""Evaluate retrieval against a clinician-reviewed gold set.

Run: python scripts/evaluate_rag.py evaluation/gold.json
Requires a populated pgvector DB, embedding API and approved references.
Exits nonzero when coverage is insufficient or thresholds fail.
"""
import json
import sys
from pathlib import Path
from app import create_app
from app.rag.service import retrieve

def evaluate(cases, search):
    if not cases:
        raise ValueError("Gold set is empty")
    totals = {"hit_at_4": 0, "recall_at_4": 0.0, "mrr_at_4": 0.0}
    details = []
    for case in cases:
        expected = set(case["relevant_source_ids"])
        if not expected:
            raise ValueError("Each case requires reviewed relevant_source_ids")
        found = [row["source_id"] for row in search(case["query"], limit=4)]
        hits = expected.intersection(found)
        rank = next((i for i, key in enumerate(found, 1) if key in expected), None)
        totals["hit_at_4"] += bool(hits)
        totals["recall_at_4"] += len(hits) / len(expected)
        totals["mrr_at_4"] += 1 / rank if rank else 0
        details.append({"id": case["id"], "retrieved": found,
                        "expected": sorted(expected), "hit": bool(hits)})
    count = len(cases)
    return {**{key: round(value / count, 4) for key, value in totals.items()},
            "cases": count, "details": details}

def main():
    cases = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    app = create_app()
    with app.app_context():
        result = evaluate(cases, retrieve)
    print(json.dumps(result, indent=2))
    # Provisional engineering gates, not clinical acceptance criteria.
    if result["cases"] < 20 or result["hit_at_4"] < 0.85 or result["recall_at_4"] < 0.75:
        sys.exit(1)

if __name__ == "__main__":
    main()
