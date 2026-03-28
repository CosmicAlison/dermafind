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
