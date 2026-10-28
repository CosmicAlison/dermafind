Dermafind is a full-stack acne analysis and skincare recommendation platform that combines computer vision with large language models to provide personalized skincare guidance based on facial image analysis.

The system uses a **custom YOLOv26 model** to detect acne types from uploaded images and an **LLM-driven recommendation engine** aligned with the **IGA acne severity grading scale**.

---

## Features

- Image-based acne detection and classification
- Detection of six acne types:
  - Pustule
  - Dark spot
  - Nodule
  - Papule
  - Whitehead
  - Blackhead
- Personalized skincare recommendations using the **IGA acne grading scale**
- JWT-based authentication with **refresh token rotation and revocation**
- Microservices architecture with **asynchronous inference processing**

---

## Architecture

The platform follows a **microservices architecture**, where services are independently deployed and communicate through a gateway.

| Service | Tech Stack | Purpose |
|--------|--------|--------|
| **Auth Service** | Spring Boot, Spring Security, Spring Data JPA, Hibernate, PostgreSQL | Handles JWT authentication, access tokens, refresh tokens, and token revocation |
| **Inference Service** | Python, Flask, YOLOv26 custom model, Celery, Redis | Processes uploaded images, performs acne detection, and returns structured predictions |
| **Gateway** | OpenResty (Nginx + Lua) | Reverse proxy responsible for routing, authentication validation, and CORS handling |
| **Frontend** | React, Vite, TypeScript | User interface for scans, results, authentication |
| **Async Tasks** | Celery + Redis | Background job processing for inference workloads |
| **Database** | PostgreSQL | Stores users and application metadata |

---

## Demo

A video demonstration of the platform is available here:

https://drive.google.com/file/d/1HCAwaoGaVFXmdRQXCtw1Cf-UNQpd55_a/view?usp=sharing
---

## System Flow

1. User uploads a facial image from the frontend
2. Request is routed through the **OpenResty gateway**
3. Gateway validates the **JWT token with the Auth Service**
4. Image is forwarded to the **Inference Service**
5. **Celery workers** process the image asynchronously
6. The **YOLOv26 model** detects acne types and returns structured predictions
7. The **LLM generates skincare recommendations** using the IGA grading scale
8. Results are returned to the frontend

---

**Note:**  
Running the inference service locally requires a **Roboflow API key**. Without it, acne detection will not function.

---

## Prerequisites

- Docker
- Docker Compose
- Node.js 20+ (for frontend development)

---

## Environment Variables

Create a `.env` file in the root directory.


ROBOFLOW_API_KEY=your_roboflow_key_here
VITE_API_BASE_URL=http://localhost/api

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

REDIS_URL=redis://redis:6379


---

## Running Locally (Development)

Clone the repository:


git clone https://github.com/yourusername/dermafind.git

cd dermafind


Create the `.env` file with the required variables.

Start all services:


docker compose up --build


This launches:

- Auth Service
- Forum Service
- Inference Service
- OpenResty Gateway
- React Frontend
- PostgreSQL
- Redis

Access the application:


http://localhost:3000


---

## Notes

- The frontend expects the API at `/api` (configured via `VITE_API_BASE_URL`)
- Large image uploads are supported (up to **16MB**)
- Without a **Roboflow API key**, inference will fail but **authentication features remain usable**

---

## Gateway Responsibilities

The **OpenResty gateway** performs the following tasks:

- Routes `/api/*` requests to the correct microservice
- Validates JWT tokens for protected routes
- Injects user context headers for downstream services
- Handles CORS configuration for frontend communication

---

## Evidence-grounded recommendations (RAG, experimental)

This feature is implemented **without LangChain or LlamaIndex**. It uses plain Python, Flask, SQLAlchemy, OpenRouter's embedding API, and PostgreSQL/pgvector. It is on the `feature/dermatology-rag-pgvector` branch and is **not yet validated for clinical use**.

### How it works

1. **Curate**: Select licensed, clinically reviewed dermatology guidance. Prepare JSON objects with `source_id`, `title`, `source_url`, and `content`. No patient photos or user scan histories are indexed.
2. **Ingest**: `scripts/ingest_references.py` validates each excerpt, requests a 1536-dimensional embedding from OpenRouter, and upserts it into `dermatology_chunks` with `published=false`.
3. **Approve**: A human reviewer checks source reliability, relevance, licensing, and currency, then explicitly sets `published=true` for approved entries.
4. **Scan**: The existing Roboflow detection pipeline persists lesion counts and a severity estimate. Celery invokes recommendation generation with a stored scan.
5. **Query**: `build_scan_summary` constructs a textual summary; the same embedding model encodes that summary.
6. **Retrieve**: `app/rag/service.py` uses pgvector's cosine-distance operator `<=>`, considers only published entries, selects up to four nearest chunks, and applies a maximum-distance threshold.
7. **Augment**: The prompt combines scan data with numbered retrieved excerpts and source URLs. Retrieved text is explicitly treated as untrusted reference content, not instructions.
8. **Generate**: OpenRouter returns the recommendation in the existing JSON response format. Retrieval fails closed if no approved evidence matches.

### Run locally

See [RAG-SETUP.md](RAG-SETUP.md) for the database schema, ingestion commands, environment configuration, and publication workflow. The configured embedding model must return exactly 1536 dimensions. Verify provider/model availability and pricing before running. Existing Postgres volumes require migration planning and backup.

### Evaluation plan (required before merge)

**Retrieval**: Build a gold dataset of at least 20 varied, clinician-reviewed query scenarios (comedonal, inflammatory, nodular, different severity levels, no lesions, ambiguous and out-of-distribution inputs). Each scenario must include an `id`, `query`, and at least one `relevant_source_ids` entry matching approved database records. Use no real patient data.

Run from `services/inference-service` with a populated database and embedding credentials:

```bash
python scripts/evaluate_rag.py evaluation/gold.json
python -m unittest discover -s tests -p 'test_evaluate_rag.py'
```

The script reports **Hit@4**, **Recall@4**, and **MRR@4**, including per-case retrievals. It exits nonzero for fewer than 20 cases, Hit@4 below 0.85, or Recall@4 below 0.75. These are **provisional engineering gates**, not clinical validation thresholds. No actual evaluation scores have been produced yet: an approved corpus and gold set are still required.

**Generation**: Have qualified clinical reviewers assess a separate held-out set of recommendations for factual grounding, correct attribution to sources, harmful/contraindicated advice, escalation for nodular or severe cases, uncertainty handling, and readability. Compare **RAG versus the prior non-RAG baseline** on identical cases. Record failures and clinician decisions; any critical unsafe recommendation blocks release. Add automated checks for response schema, missing sources, irrelevant retrieval, embedding failures, prompt injection in source text, and user isolation.

**Known gaps**: The current recommendation table stores text but not source IDs, so provenance is not yet persisted or exposed in the UI. No end-to-end evaluation, medical review, or CI gate has run. Source licensing, evidence freshness, model/provider compatibility, database migrations, and clinical safety must be addressed before production use.

### Candidate clinical sources

The user-supplied sources are tracked in [the source registry](services/inference-service/references/source_registry.json):

- **EuroGuiDerm Acne Guideline, 2025, long version**: primary evidence candidate. Sections cover comedonal, papulopustular, and nodular/conglobate acne; treatment selection, antibiotics, pregnancy considerations, isotretinoin, and maintenance. The PDF states **CC BY-NC 4.0**. Do not reproduce/embed substantial adapted guideline text in a commercial product without confirming permissions. Store independently reviewed, properly attributed summaries or licensed excerpts with page numbers and revision date.
- **YouTube video `qFOoyk-YqE4`**: supplementary candidate only. Video metadata/transcript were not reliably accessible; verify author credentials, transcript, claims, and reuse rights before indexing. Never promote a video above a clinical guideline in the evidence hierarchy.

**Status:** Both URLs are registered, but **neither is embedded, published, or included in retrieval yet**. A source registry is not a populated knowledge base. Clinical review and an approved corpus are prerequisites to running the retrieval evaluation.
