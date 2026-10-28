# Dermatology RAG setup

This branch adds pgvector-based evidence retrieval to the existing recommendation task. No clinical excerpts are bundled: source content must be independently reviewed and licensed for storage.

1. Set OPENROUTER_API_KEY and verify that your account supports the configured embedding and chat models. Embeddings must return 1536 dimensions.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Apply the schema from the repository root: `docker compose exec -T postgres psql -U postgres -d inferencedb < services/inference-service/app/rag/schema.sql`.
4. Prepare a JSON array of approved excerpts. Each entry has `source_id`, `title`, `source_url` (HTTPS), and `content` (up to 4000 characters). Keep copyright permissions and review metadata separately.
5. Run ingestion from within the inference service image, with the JSON file mounted into the container: `python scripts/ingest_references.py /path/to/references.json`.
6. Manually approve reviewed excerpts: `UPDATE dermatology_chunks SET published=true WHERE source_id='reviewed-source-id';`.
7. Start/restart the inference service and Celery worker: `docker compose up -d --build inference-service celery-worker`.

Retrieval fails closed when no published excerpts match. It does not embed user photos or scan history. Existing recommendation records do not store provenance yet. The frontend does not display citations yet. Do not deploy for clinical use without evidence review, model validation, security review, and integration tests.

Note: Docker's existing PostgreSQL volume may require a compatible pgvector extension installation before changing the image. Take a backup before changing a persistent database.
