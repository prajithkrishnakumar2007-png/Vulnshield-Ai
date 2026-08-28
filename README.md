# VulnShield AI 🛡️🤖

**VulnShield AI** is an enterprise-grade AI-assisted vulnerability prioritization and remediation platform. It addresses scanner alert floods by ingesting raw security findings (Snyk, Tenable Nessus), deduplicating asset findings via SHA-256 hashes, computing a composite risk score (**CVSS + EPSS + CISA KEV**), visualizing priorities using 2D and 3D web graphics, and leveraging Anthropic Claude 3.5 Sonnet to generate 1-click remediation playbooks and multi-step investigation traces.

---

## 🏗️ Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                 VULNSHIELD AI                                     |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                  Frontend (Next.js 14 App Router + R3F)                   |   |
|   |   - Dark Cyber Theme (#05070D, #00E5FF, #7C5CFF, #FF3B5C, #00FFA3)         |   |
|   |   - 3D ThreatGlobe & 3D RiskOrb (React Three Fiber + drei)                |   |
|   |   - Recharts EPSS vs CVSS Scatter Plot + Severity Breakdown               |   |
|   |   - AI Remediation Panel + Animated Investigation Agent Reasoning Trace   |   |
|   |   - AI-Only vs Human+AI Product Design Split-Screen Showcase (/build-mode)|   |
|   +---------------------------------------------------------------------------+   |
|                                       | HTTP / REST (Port 8080)                   |
|                                       v                                           |
|   +---------------------------------------------------------------------------+   |
|   |                      Backend (FastAPI + Python 3.12)                      |   |
|   |   - Auth & RBAC (JWT + PBKDF2 Hashing)                                    |   |
|   |   - Scanner Ingestion & SHA-256 Deduplication Service                     |   |
|   |   - Risk Scoring Engine: 0.4*CVSS + 0.4*EPSS + 0.2*KEV                    |   |
|   |   - Threat Intel Integration (FIRST EPSS + CISA KEV)                      |   |
|   |   - Anthropic Claude 3.5 Sonnet SDK Integration                           |   |
|   |   - Multi-Step Investigation Reasoning Agent                              |   |
|   |   - SOC2 & ISO 27001 Compliance Report Generator                          |   |
|   +---------------------------------------------------------------------------+   |
|                                       | Async SQLAlchemy                          |
|                                       v                                           |
|   +---------------------------------------------------------------------------+   |
|   |                     Database (PostgreSQL 15 / SQLite)                     |   |
|   |   - users, vulnerabilities, risk_scores, remediations,                   |   |
|   |     reasoning_traces, reports, audit_logs                                 |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 🧰 Tech Stack

- **Frontend:** React 18, Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts, Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`), Framer Motion.
- **Backend:** FastAPI, Uvicorn, SQLAlchemy (Async), Pydantic v2, `python-jose`, `passlib`, `anthropic` Python SDK, `httpx`.
- **Database:** PostgreSQL 15+ (with automated SQLite fallback for local development).

---

## 🚀 Quickstart & Setup

### 1. Docker Compose (Recommended)

Spins up PostgreSQL, FastAPI backend, and Next.js frontend together:

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API Docs: [http://localhost:8080/docs](http://localhost:8080/docs)

### 2. Manual Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/macOS: source venv/bin/activate

pip install -r requirements.txt email-validator
python app/mock_data/seed.py  # Seed database tables and sample findings
uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Modules & Capabilities

1. **Auth Module (`/api/v1/auth`)**: JWT user authentication & Role-Based Access Control (Admin / Analyst).
2. **Ingestion Module (`/api/v1/ingestion`)**: Raw JSON upload parser for Snyk & Tenable Nessus findings.
3. **Normalization & Dedup Module**: SHA-256 asset hash deduplication to eliminate scanner noise.
4. **Risk Scoring Engine (`/api/v1/risk-scoring`)**: Composite score formula: `(0.4 * CVSS*10) + (0.4 * EPSS*100) + (0.2 * KEV)`.
5. **Threat Intel Module (`/api/v1/threat-intel`)**: FIRST EPSS API & CISA KEV feed integration with fallback.
6. **Prioritization & Visualization (`/dashboard`)**: Recharts scatter plot, 3D RiskOrb header, severity breakdown donut.
7. **Triage Matrix (`/vulnerabilities`)**: Filterable, sortable vulnerability table with status transition lifecycle.
8. **AI-Assisted Remediation (`/vulnerabilities/[id]`)**: Claude 3.5 Sonnet generated structured fix playbooks + copyable CLI commands.
9. **Investigation Agent (`/vulnerabilities/[id]`)**: Multi-step chain-of-reasoning agent (Exploit, Exposure, Blast Radius, Business Context).
10. **Reports & Compliance (`/reports`)**: MTTR trend metrics and SOC2 / ISO 27001 audit export JSON.
11. **Admin Control (`/admin`)**: Risk weight sliders, API key management, user table, audit log stream.
12. **Showcase View (`/build-mode`)**: Split-screen slider comparing ungoverned AI output vs VulnShield AI enterprise craft.

---

## 🔑 Default Credentials

- **Admin User:** `admin@vulnshield.ai` / `admin123`
- **Analyst User:** `analyst@vulnshield.ai` / `analyst123`
