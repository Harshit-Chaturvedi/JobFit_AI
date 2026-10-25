<div align="center">

# ✨ JobFit AI

### Find the fit. Close the gaps. Apply with confidence.

**Turn a resume and a job description into an evidence-led match analysis and a practical next-step plan.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)

**Resume analysis** &nbsp;·&nbsp; **Semantic matching** &nbsp;·&nbsp; **Career planning**

</div>

---

## Contents

- [What it does](#-what-it-does)
- [How matching works](#-how-matching-works)
- [Get started](#-get-started)
- [Configuration](#-configuration)
- [Privacy and data](#-privacy-and-data)
- [API reference](#-api-reference)
- [Project structure](#-project-structure)
- [Development checks](#-development-checks)

## 🌟 What it does

JobFit AI helps candidates understand how their experience relates to a specific role, what evidence supports that match, and what to work on next.

| Analyze a role | Compare opportunities | Build a plan |
| :--- | :--- | :--- |
| Upload a PDF resume to see your match score, relevant experience, strengths, and skill gaps. | Compare up to four job descriptions against the same resume. | Get resume wording suggestions, project ideas, and a prioritized learning roadmap. |

### The application workflow

```text
Upload resume  →  Paste job description  →  Review match & evidence
                                                ↓
                         Tailor resume  ←  Compare roles  ←  Plan next steps
```

**Also included:** a resume-grounded career assistant, printable report export, a browser-local dashboard, and learning-roadmap checkboxes.

> [!IMPORTANT]
> Treat generated suggestions as drafts to review. The resume should remain the source of truth; do not claim experience, skills, or achievements you do not have.

## 🧠 How matching works

JobFit combines three signals to give a broader view than a keyword count alone:

| Signal | Default weight | Purpose |
| :--- | :---: | :--- |
| Semantic similarity | **35%** | Measures conceptual alignment between job requirements and resume sections. |
| Gemini analysis | **45%** | Assesses role fit, relevant experience, and the depth of evidence. |
| Explicit skill match | **20%** | Anchors the result in skills identified as present or missing. |

```text
Resume PDF ──► Extract text ──► Resume sections ─────┐
                                                     ├──► Requirement evidence ─┐
Job description ─────────────► Job requirements ────┘                           │
                                                                                ├──► Match results
Gemini reasoning ────────────► LLM fit signal ─────────────────────────────────┤
Skill overlap ───────────────► Explicit skill signal ──────────────────────────┘
```

Weights can be adjusted with the `SCORE_WEIGHT_*` environment variables. Semantic similarity is supporting evidence; it does not prove a qualification or replace human judgment. The app uses Gemini 3.8 Flash for reasoning and Gemini Embedding 2 for semantic matching.

## ⚡ Get started

### Requirements

- **Node.js 22 or later** and **npm 9 or later**
- A [Google Gemini API key](https://aistudio.google.com/apikey)
- *(Optional)* PostgreSQL with the `pgvector` extension

### 1. Configure and start the backend

From the repository root:

```bash
cd backend
```

Copy the example environment file (`cp .env.example .env` on macOS/Linux, or `Copy-Item .env.example .env` in PowerShell), then put your key in `backend/.env`:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
```

Install dependencies and start the API:

```bash
npm install
npm run dev
```

The API listens at **http://localhost:3001**. You can check it at **http://localhost:3001/api/health**.

### 2. Start the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**, upload a PDF resume (up to 5 MB), and paste a job description.

### Optional: PostgreSQL + pgvector

The app uses in-memory semantic matching by default. To persist resume-derived records, run PostgreSQL with pgvector, set `DATABASE_URL`, then explicitly set `PERSIST_ANALYSES=true`. Review the [data and security notes](#-privacy-and-data) before enabling persistence.

## ⚙️ Configuration

The backend loads settings from `backend/.env`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | — | Gemini key; required for analysis and embeddings. |
| `PORT` | `3001` | Backend listening port. |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed browser origins. Set this to your deployed frontend origin in production. |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate-limit window in milliseconds. |
| `RATE_LIMIT_MAX_REQUESTS` | `30` | Requests allowed per IP in each window. |
| `PERSIST_ANALYSES` | `false` | Enables PostgreSQL persistence when set to `true`. |
| `DATABASE_URL` | empty | PostgreSQL connection string. |
| `EMBEDDING_MODEL` | `gemini-embedding-2` | Gemini embedding model name. |
| `EMBEDDING_DIMENSION` | `768` | Expected vector dimension. Must match the selected embedding model and database schema. |
| `SCORE_WEIGHT_SEMANTIC` | `0.35` | Semantic score weight. |
| `SCORE_WEIGHT_LLM` | `0.45` | LLM score weight. |
| `SCORE_WEIGHT_SKILL` | `0.20` | Explicit skill score weight. |

For a backend hosted at a different URL, create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=https://your-api-host.example/api
```

Restart the frontend after changing environment variables.

## 🔐 Privacy and data

- Resume text and job descriptions are sent to the configured backend for processing and to Google Gemini for AI analysis.
- With the default `PERSIST_ANALYSES=false`, resume-derived records are not saved to PostgreSQL by this app.
- Analyses saved from the dashboard and roadmap progress are stored in the browser's local storage on that device.
- The dashboard PIN is a convenience gate in that browser. It is not an account system or encryption for local data.
- CORS controls which browser origins can read API responses; it does not authenticate callers. The built-in rate limiter is in-memory and applies per server process/IP.

> [!WARNING]
> Before enabling `PERSIST_ANALYSES=true` for multiple users, add authenticated accounts, enforce record ownership, and define retention and deletion controls. Configure production CORS and rate limits for your hosting setup.

## 🔌 API reference

All endpoints are served under `/api`.

| Method | Path | Description |
| :---: | :--- | :--- |
| `GET` | `/health` | Backend health check. |
| `POST` | `/resume/parse` | Extract text from a PDF uploaded in the `resume` form field. |
| `POST` | `/matching/analyze` | Generate the main resume/job match analysis. |
| `POST` | `/semantic-match` | Calculate semantic evidence and combined score from resume/job text. |
| `POST` | `/career-plan` | Generate a tailored improvement plan. |
| `POST` | `/resume/tailor` | Generate resume headline, summary, keyword, and bullet suggestions. |
| `POST` | `/chat` | Ask a question grounded in resume and job analysis context. |

JSON endpoints accept `resumeText` and `jobDescription` as strings, except the PDF parse endpoint. See the route controllers under `backend/src/controllers/` for request and response validation.

## 🗂️ Project structure

```text
JobFit_AI/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── middleware/      # Upload and API protections
│   │   ├── routes/          # Express API routes
│   │   ├── services/        # Gemini, matching, persistence, and chat logic
│   │   ├── tests/           # Backend test suites
│   │   └── types/           # Backend TypeScript types
│   └── .env.example
└── frontend/
    └── src/
        ├── app/             # Landing, analysis, and dashboard pages
        ├── components/      # Resume, results, chat, and comparison UI
        ├── lib/             # API client
        └── types/           # Frontend TypeScript types
```

## 🧪 Development checks

Backend type check:

```bash
cd backend
npm run lint
```

Backend test suites:

```bash
npx ts-node src/tests/semanticMatching.test.ts
npx ts-node src/tests/careerPlan.test.ts
npx ts-node src/tests/careerChat.test.ts
```

Frontend lint:

```bash
cd frontend
npm run lint
```

---

<div align="center">

**JobFit AI** · Make your next application a more informed one.

</div>
