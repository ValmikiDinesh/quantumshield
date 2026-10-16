# QuantumShield — Post-Quantum Security Readiness Platform

> **Developed by Valmiki Softwares**  
> *Tagline: Prepare Your Codebase for the Post-Quantum Era*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-35%20passed-success.svg)]()
[![Standards](https://img.shields.io/badge/NIST%20PQC-FIPS%20203%20%7C%20204%20%7C%20205-blue.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.20.0-informational.svg)]()
[![License](https://img.shields.io/badge/license-Proprietary%20Valmiki%20Softwares-navy.svg)]()

---

## 1. Executive Summary

**QuantumShield** is a production-oriented Post-Quantum Cryptography (PQC) readiness platform built by **Valmiki Softwares**.

As cryptanalytically relevant quantum computers (CRQCs) advance toward viability, Shor's algorithm poses an existential threat to classical asymmetric cryptography (RSA, ECDH, ECDSA, Diffie-Hellman). Malicious actors are already executing **"Harvest Now, Decrypt Later" (HNDL)** attacks by recording encrypted traffic today to decrypt once quantum hardware emerges.

QuantumShield enables software engineers, security architects, and CISOs to discover cryptographic usage across their repositories, evaluate quantum exposure according to mathematical risk categories, and obtain actionable migration blueprints aligned with the finalized **NIST August 2024 Standards**:
- **ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism)** — Standardized in **FIPS 203**
- **ML-DSA (Module-Lattice-Based Digital Signature Algorithm)** — Standardized in **FIPS 204**
- **SLH-DSA (Stateless Hash-Based Digital Signature Algorithm)** — Standardized in **FIPS 205**

---

## 2. Product Principles & Security Guarantees

1. **Real, Testable Scanning Rules**: Built upon deterministic regex and manifest inspection rules. No fabricated results or placeholder metrics.
2. **Clear Classification Taxonomy**: Distinctly separates:
   - *Confirmed pattern match*
   - *Potential cryptographic usage*
   - *Informational observation*
   - *Needs manual verification*
3. **No Unsupported Guarantees**: QuantumShield provides a prioritized readiness assessment, not a formal mathematical audit or guarantee of quantum safety.
4. **Contextual Urgency**: Does not automatically label all RSA/ECC usage as Critical. Clearly distinguishes **Harvest Now Decrypt Later (HNDL)** confidentiality risks (high urgency) from **Future Forgeability** signature risks (urgency depends on asset lifetime).
5. **Separation of Legacy Ciphers**: Legacy broken ciphers (MD5, SHA-1, DES) are classified separately under `weak-legacy` and not conflated with quantum migration findings.
6. **Zero Code Execution**: Uploaded code is **never executed or compiled**. Build scripts and external network calls from uploaded code are disabled.
7. **Safe ZIP Processing**: Hardened against Zip Slip path traversal (`../`), decompression bombs, oversized entries, and binary junk.
8. **Automated Secret Redaction**: Private keys, JWT tokens, AWS keys, passwords, and GitHub tokens are redacted (`[REDACTED_SECRET]`) before storage or presentation.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript 5, Tailwind CSS, Lucide React, React Router 6, Recharts |
| **Backend** | Node.js (v18/v20), Express 4, TypeScript 5, Zod 3, Mongoose 8 (MongoDB Atlas / Local), Multer |
| **Document Export** | PDFKit (Executive PDF layout), JSON Schema Export |
| **AI Assistant** | Contextual PQC advice with automated secret redaction; supports Google Gemini API with fallback expert engine |
| **Testing** | Vitest 1.6 (unit, scanner, and frontend tests), Supertest 7 (API integration tests) |
| **DevOps** | Multi-stage Dockerfile, Docker Compose, GitHub Actions CI workflow |

---

## 4. Directory Structure

```
QuantumShield/
├── backend/                       # Node.js Express & Scanner Engine
│   ├── src/
│   │   ├── config/                # Environment schema with Zod
│   │   ├── controllers/           # Auth, Project, Scan, Dashboard, Org controllers
│   │   ├── db/                    # MongoDB connection lifecycle
│   │   ├── docs/                  # OpenAPI 3.0 specification
│   │   ├── middleware/            # JWT Auth, Zod Validation, Rate Limiters
│   │   ├── models/                # User, Organization, Project, Scan, AuditLog
│   │   ├── routes/                # API router definitions
│   │   ├── scanner/               # Core Scanning Engine
│   │   │   ├── rules/             # Versioned PQC Rule Catalog & types
│   │   │   ├── extractor.ts       # Anti-Zip Slip safe extraction
│   │   │   ├── manifestInspector.ts # package.json, requirements.txt, go.mod
│   │   │   ├── redactor.ts        # Secrets masking engine
│   │   │   ├── readinessAssessor.ts # Score formula & inventory aggregator
│   │   │   └── engine.ts          # Scanner orchestrator
│   │   ├── services/              # AuthService, ReportService (PDF/JSON), AIExplanation
│   │   ├── types/                 # Backend interfaces & shared types
│   │   ├── __tests__/             # Supertest API integration tests
│   │   ├── app.ts                 # Express app configuration
│   │   └── server.ts              # Entrypoint listener
│   └── package.json
├── frontend/                      # React + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── api/                   # Typed API client with JWT interceptor
│   │   ├── components/            # Reusable UI & Scanner components
│   │   ├── context/               # AuthContext (login, register, session)
│   │   ├── pages/
│   │   │   ├── public/            # LandingPage, LoginPage, RegisterPage
│   │   │   └── app/               # Dashboard, Projects, ScanDetail, Compare, Billing
│   │   ├── types/                 # Client DTO definitions
│   │   ├── App.tsx                # React Router layout
│   │   └── main.tsx               # Entrypoint
│   └── package.json
├── shared/                        # Shared TypeScript type definitions
├── test-fixtures/                 # Safe mock test repositories (.zip archives)
├── Dockerfile                     # Multi-stage production container
├── docker-compose.yml             # MongoDB + Backend container stack
├── .github/workflows/ci.yml       # GitHub Actions CI matrix
├── .env.example                   # Environment configuration template
└── package.json                   # Root workspace orchestration
```

---

## 5. Getting Started & Installation

### Prerequisites
- **Node.js**: v18.20.0 or higher
- **npm**: v10.0.0 or higher
- **MongoDB**: Local MongoDB daemon running on port 27017 or a MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/valmiki-softwares/quantumshield.git
cd QuantumShield

# Install dependencies across all workspaces
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure Environment Variables

```bash
cp .env.example backend/.env
```

Ensure `backend/.env` has the following variables configured:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/quantumshield
JWT_SECRET=quantumshield_secure_jwt_secret_dev_only
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
MAX_UPLOAD_SIZE_MB=25

# Optional: Google Gemini API key for dynamic AI explanations
# (Leave empty to use the built-in deterministic expert cryptographer engine)
GEMINI_API_KEY=
```

### 3. Start Development Servers

You can run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend API (port 5001)
npm run dev:backend

# Terminal 2: Frontend SPA (port 5173)
npm run dev:frontend
```

Open your browser at **http://localhost:5173**.

---

## 6. Demo Accounts & Test Fixtures

### Default Demo Account
You can sign up with any email, or click the **"Fill Demo Credentials"** button on the Login page:
- **Email**: `test-valmiki-lead@example.com`
- **Password**: `Password123!Secure`

### Built-in Test Repositories
The platform includes pre-built synthetic test fixtures located in `test-fixtures/`:
1. `classical-vulnerable-repo.zip`: Contains RSA keygen, ECDH key exchange, RS256 JWT tokens, and legacy MD5 hashing.
2. `hybrid-pqc-ready-repo.zip`: Implements ML-KEM-768, ML-DSA-65, SLH-DSA, and hybrid X25519MLKEM768 key exchange.
3. `clean-service-repo.zip`: Non-cryptographic utility service verifying zero false positives.

You can also trigger these fixtures directly within the UI via the **"One-Click Demo Scan"** buttons in any project view.

---

## 7. Running Automated Tests

QuantumShield includes a test suite covering scanner pattern matching, secret redaction, Zip Slip defenses, API endpoints, and React components.

```bash
# Run all tests
npm test

# Run backend tests only (Vitest + Supertest)
npm run test:backend

# Run frontend tests only (Vitest + React Testing Library)
npm run test:frontend
```

---

## 8. Building for Production & Docker

### Local Production Build
```bash
# Compile TypeScript for backend and bundle Vite frontend
npm run build
```

### Running with Docker Compose
```bash
docker-compose up --build
```
This launches:
- `mongodb` container on port `27017`
- `backend` container on port `5001` serving API endpoints and health checks

---

## 9. API Reference

All endpoints are prefixed with `/api`. An interactive OpenAPI 3.0 specification is available at `GET /api/docs/openapi.json`.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status and branding | No |
| `GET` | `/api/docs/openapi.json` | OpenAPI 3.0 specification | No |
| `POST` | `/api/auth/register` | Register new user and organization | No |
| `POST` | `/api/auth/login` | Authenticate with email/password and obtain JWT | No |
| `GET` | `/api/auth/me` | Fetch active user profile and organization | Yes |
| `POST` | `/api/auth/logout` | Terminate session and audit log | Yes |
| `GET` | `/api/projects` | List projects for user organization | Yes |
| `POST` | `/api/projects` | Create a new project | Yes |
| `GET` | `/api/projects/:id` | Get project metadata and latest scan | Yes |
| `PATCH` | `/api/projects/:id` | Update project metadata | Yes |
| `DELETE` | `/api/projects/:id` | Delete project and associated scans | Yes |
| `POST` | `/api/projects/:id/scans` | Upload ZIP archive and execute scan | Yes |
| `POST` | `/api/projects/:id/quick-scan-demo` | One-click demo scan against test fixtures | Yes |
| `GET` | `/api/projects/:id/scans` | Historical scans for a project | Yes |
| `GET` | `/api/scans/:scanId` | Full scan findings and algorithm inventory | Yes |
| `GET` | `/api/scans/compare` | Compare Scan A vs Scan B diff and delta score | Yes |
| `GET` | `/api/scans/:scanId/report/json` | Download JSON schema readiness report | Yes |
| `GET` | `/api/scans/:scanId/report/pdf` | Download executive PDF readiness report | Yes |
| `POST` | `/api/scans/:scanId/findings/:id/ai-explain` | Generate plain-English AI remediation guidance | Yes |
| `GET` | `/api/dashboard/stats` | Aggregate metrics, severity counts, and review queue | Yes |
| `GET` | `/api/organizations/current` | Active subscription plan and usage meters | Yes |
| `PATCH` | `/api/organizations/current/plan` | Update subscription plan tier (Simulated Billing) | Yes |

---

## 10. Known Limitations & Future Roadmap

### Current MVP Scope
- Scans source code archives (.zip) up to 25MB and 1,000 files.
- Static regex and AST pattern matching without binary disassembly.
- Billing is currently in simulated sandbox mode.

### Prioritized Next Steps
1. **GitHub App & GitLab CI Integration**: Automated pull-request scanning on commit hooks.
2. **Semgrep & Tree-sitter Rule Expansion**: Semantic taint tracking to trace key material flow.
3. **Software Bill of Materials (SBOM)**: CycloneDX and SPDX export with cryptographic asset inventory (CBOM).
4. **Live Key Exchange Probing**: Network handshake probe to test external TLS endpoints for hybrid post-quantum cipher suites.
5. **Stripe Billing Integration**: Real payment processing for Developer, Team, and Enterprise tiers.

---

## 11. Authors & Ownership

Developed with pride by **Valmiki Softwares**.  
For enterprise inquiries, custom rule sets, and compliance guidance:  
📧 **security@valmikisoftwares.com**
