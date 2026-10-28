# Source review and evaluation

The EuroGuiDerm PDF is a third-party CC BY-NC 4.0 publication. This repository does **not** redistribute its text or automatically publish its contents.

1. Obtain the PDF directly from the European Dermatology Forum and verify its license for your intended use.
2. Install `pymupdf` in your local extraction environment.
3. Run `python scripts/extract_guideline.py /path/to/guideline.pdf --out references/candidates.local.json`.
4. Inspect each page and each generated candidate, especially treatment tables, figures, and multi-column layouts. Extraction is mechanical, **not** clinical review.
5. Have a qualified reviewer rewrite/approve individual evidence records, recording page, section, safety caveats, and review date. Check copyright permissions before storing excerpts.
6. Produce the ingestion JSON (`source_id`, `title`, `source_url`, `content`) from approved records only. The ingestion script still defaults to unpublished.
7. Generate a gold-set worksheet with `python scripts/build_gold_template.py --out references/gold-template.local.json`. Have reviewers label `relevant_source_ids` against the approved corpus.
8. Run `python scripts/evaluate_rag.py references/gold-reviewed.local.json` with the approved corpus and embeddings service available. Record retrieval metrics, per-case failures, and model/config versions.
9. Separately review generated recommendations for unsupported claims, safety, contraindications, referral escalation, and attribution. Compare against the non-RAG baseline.

The YouTube source is not included in the evidence corpus until its transcript, credentials, and reuse permissions are verified.

**Current status:** Extraction and gold-template scripts are committed; no guideline text, reviewed labels, clinical approval, embeddings, or evaluation results are included.
