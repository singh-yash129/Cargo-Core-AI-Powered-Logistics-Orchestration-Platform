# Logistics & Personal Move Management System

## Project Overview
This project is a **Centralized Cloud Platform** where all roles interact with one shared database. It is designed to manage the full lifecycle of logistics, specifically optimized for the "Personal Move" (House Shift) scenario—the system's most complex use case. By integrating real-time GPS, inventory, and labor management, it provides a seamless flow from initial booking to final delivery.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vue 3, Vite, Pinia |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database** | PostgreSQL 16 (async via asyncpg + SQLAlchemy) |
| **Cache / Realtime** | Redis 7 |
| **Migrations** | Alembic |
| **Auth** | JWT (access + refresh tokens) |
| **AI / GenAI** | Google Gemini API + RAG |
| **Maps** | Google Maps Platform |
| **Video** | Daily.co |
| **Background Tasks** | Celery |
| **Containerization** | Docker + Docker Compose |

---

## System Architecture
The platform is built on three core pillars:
- **The Backend (The Engine):** Houses the primary logic for routing, inventory, and GenAI.
- **The Frontend (The Dashboards):** Six different "Views" tailored specifically to each role.
- **The Database (The Heart):** Stores all live data, including GPS, Stock, Labor, and Payments.

---

## Running the Project

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ and npm/yarn (for frontend dev)
- Python 3.11+ (for backend dev without Docker)

---

### Option 1 — Docker (Recommended)

```bash
# From the backend folder
cd backend
docker-compose up --build
```

This starts three containers:
| Container | Service | Port |
| :--- | :--- | :--- |
| `logistics_app` | FastAPI backend | `http://localhost:8000` |
| `logistics_dbw` | PostgreSQL database | `localhost:5432` |
| `logistics_redis` | Redis cache | `localhost:6379` |

Alembic migrations run automatically on startup.

---

### Option 2 — Manual (Dev Mode)

#### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env            # then fill in your values

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend runs at: `http://127.0.0.1:8000`
API docs (Swagger UI): `http://127.0.0.1:8000/docs`
API docs (ReDoc): `http://127.0.0.1:8000/redoc`

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

Create a `.env` file inside the `backend/` folder with the following:

```env
# Application
APP_ENV=development
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql+asyncpg://logistics_user:logistics_pass@localhost:5432/logistics_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Google APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GEMINI_API_KEY=your-gemini-api-key

# Daily.co (Video Conferencing)
DAILY_API_KEY=your-daily-api-key

# PostgreSQL (used by Docker Compose)
POSTGRES_USER=logistics_user
POSTGRES_PASSWORD=logistics_pass
POSTGRES_DB=logistics_db
```

For the frontend, create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## Server / Port Reference

| Service | URL | Notes |
| :--- | :--- | :--- |
| Frontend (Vite dev) | `http://localhost:5173` | Run `npm run dev` in `frontend/` |
| Backend API | `http://127.0.0.1:8000` | Run uvicorn or Docker |
| Swagger UI | `http://127.0.0.1:8000/docs` | Auto-generated API docs |
| ReDoc | `http://127.0.0.1:8000/redoc` | Alternative API docs |
| PostgreSQL | `localhost:5432` | DB: `logistics_db` |
| Redis | `localhost:6379` | Cache & pub/sub |

---

## Running Tests

```bash
cd backend

# Run all tests
pytest

# Run specific suites
pytest tests/unit/
pytest tests/integration/
pytest tests/contract/
pytest tests/test_ai/

# With verbose output
pytest -v
```

---

## Key Roles & Workflow
The system follows a sequential six-step process to ensure operational efficiency:

| Sequence | Role | Primary Tool | Output to Next Role |
| :--- | :--- | :--- | :--- |
| 1 | Individual/Vendor | Booking UI | Order Data (ORDER_ID) |
| 2 | Logistics Manager | Admin Dashboard | Approved Workflow Resource |
| 3 | Warehouse Manager | Inventory/Staff Map | Packed Box + Crew Logic |
| 4 | Dispatcher | Route Map | Assigned Route Execution |
| 5 | Driver | Mobile App | Proof of Delivery |
| 6 | AI Bot | Chat Interface | Customer Rating Support |

---

## Detailed Module Specifications

### 1. Logistics Manager (System Owner)
- **Organizational Architecture:** Multi-warehouse provisioning and Role-Based Access Control (RBAC) to link managers to specific hubs.
- **Global Control Tower:** Integrated fleet map using Google Maps to monitor active vehicles and real-time KPI visualization.
- **Geofencing:** Digital boundaries that trigger "Auto-Arrival/Departure" timestamps and security alerts for unauthorized movement.
- **Financial Ledger:** Monitors Cash on Delivery (COD) and automates payroll based on distance and performance.

### 2. Warehouse Manager (Regional Administrator)
- **Inventory & Stock:** Real-time SKU tracking (Aisle/Shelf/Bin) and automated safety stock alerts.
- **Resource Management:** Manages the labor roster and assigns "Helpers" to moves.
- **Internal Mapping:** Digitized floor plans (2D grids) and dynamic slotting to maximize picking speed.

### 3. Dispatcher (Operational Coordinator)
- **Dynamic Route Optimization:** Solves the "Traveling Salesman Problem" using automated batching and real-time traffic data.
- **Constraint-Based Routing:** Accounts for vehicle size (e.g., avoiding narrow streets) and seat capacity for laborers.
- **Crisis Management:** Real-time re-optimization of routes if a truck breaks down.

### 4. Driver (Field Execution - Mobile App)
- **Interactive Manifest:** Digital checklists for vehicle check-in and sequential stop lists with special instructions.
- **Geofence Integration:** Automatic "Driver is outside" notifications sent to customers when within 50m of the address.
- **Proof of Delivery (PoD):** Captures photos, e-signatures, and QR scans to close orders.

### 5. AI Customer Support (The "Amazon-Style" Bot)
- **Intelligent Tracking:** Pulls live GPS and ETA data to answer "Where is my stuff?".
- **Autonomous Problem Solving:** Handles address corrections, rescheduling, and refund initiation.
- **Escalation:** Uses sentiment analysis to "hot-swap" conversations to a human manager if a customer is angry.

---

## Generative AI Integration
The system leverages Google Gemini and Retrieval-Augmented Generation (RAG) to prevent hallucinations:

- **Predictive Labor Scaling:** Suggests shifting staff between hubs based on predicted volume.
- **AI Visual Volume Estimator:** Requesters can upload photos of their room; the AI estimates the number of boxes and laborers required.
- **Smart Parking Assistant:** Analyzes historical data to suggest parking spots to drivers.
- **Natural Language Analytics:** Managers can ask questions like *"Who was my most efficient driver last week?"* to get instant summaries and charts.

---

## Project Structure

```
QuadCore-Devs/
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── routers/       # FastAPI route handlers
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── services/      # Business logic layer
│   │   └── main.py        # App entry point
│   ├── alembic/           # Database migrations
│   ├── tests/             # Test suites (unit, integration, contract, ai)
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── LWD-views/     # Role-specific dashboard views
│       ├── stores/        # Pinia state management
│       ├── composables/   # Vue composables
│       ├── config/        # API config
│       └── main.js
├── driver-app/            # Mobile app for drivers
└── docs/                  # Project documentation
```
