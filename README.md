<div align="center">

# ✨ JobFit AI

### Know how well you fit a role — before you apply.

**An AI-powered workspace for analyzing resumes, comparing opportunities, and planning a stronger application.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e)](LICENSE)

`Resume intelligence` · `Semantic matching` · `Career action plans`

</div>

---

## 🌟 What JobFit AI does

JobFit AI turns a resume and a job description into a practical, evidence-led application strategy. It combines language-model reasoning, vector similarity, and explicit skill verification.

| 🎯 Analyze | ⚖️ Compare | ✨ Improve |
| :--- | :--- | :--- |
| See a fit score, strengths, gaps, and relevant experience. | Compare one resume against up to four opportunities. | Get truthful resume wording, project ideas, and a learning roadmap. |

> [!IMPORTANT]
> The resume is the source of truth. Recommendations improve presentation; they should not invent experience, achievements, or skills.

---

## 🚀 Feature tour

### 🔍 Evidence-backed semantic matching

- **Vector embeddings** — Split resumes and job descriptions into meaningful sections before comparing them with Gemini embeddings.
- **Requirement evidence** — Connect matching requirements to resume excerpts and call out unsupported requirements.
- **Composite score** — Blend semantic similarity, LLM reasoning, and explicit skills into a configurable 0–100 score.
- **Graceful fallback** — Run in memory by default; PostgreSQL + pgvector persistence is optional.

### 🧭 Candidate improvement plan

- A snapshot of the candidate's top strength, biggest gap, and next action.
- Prioritized missing skills with realistic learning effort.
- Role-specific resume improvements and portfolio project recommendations.
- A three-tier roadmap: **Must Learn**, **Should Learn**, and **Nice to Have**.

### 💬 Career assistant & ATS resume tailor

- Ask grounded questions about a role, your score, and your next move.
- Generate an ATS-aware headline, summary, keywords, and bullet suggestions.
- Keep suggestions tied to the supplied resume.

### 📊 Personal workflow tools

- Compare multiple roles against one resume.
- Export a clean, printable match report as a PDF through the browser print dialog.
- Save analyses in the current browser and track roadmap tasks.
- Optional local dashboard PIN for an extra layer of privacy on a shared device.

---

## 🧠 How scoring works

```text
  Resume PDF ──► text extraction ──► structured resume chunks ──┐
                                                                  ├──► semantic evidence
  Job description ────────────────► requirement chunks ──────────┘
                                                                            │
                 Gemini reasoning ───────────────► LLM fit score          │
                 Explicit skill overlap ─────────► skill match score      │
                                                                            ▼
                                                           ┌────────────────────┐
                                                           │  Final Match Score │
                                                           └────────────────────┘
```

| Signal | Default weight | What it measures |
| :--- | :---: | :--- |
| Semantic similarity | 35% | Conceptual alignment between requirements and resume evidence |
| LLM reasoning | 45% | Nuanced role fit, seniority, and experience alignment |
| Explicit skill match | 20% | Skills clearly evidenced in the resume |

Weights can be changed with environment variables.

---

## 🛠️ Tech stack

| Area | Technology |
| :--- | :--- |
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS |
| Backend | Node.js · Express · TypeScript |
| AI | Google Gemini 2.0 Flash · `text-embedding-004` |
| Document parsing | `pdf-parse` |
| Optional storage | PostgreSQL + pgvector |

---

## ⚡ Quick start

### Prerequisites

- Node.js **22+**
- npm **9+**
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Start the API

```bash
cd backend
cp .env.example .env
# Add GEMINI_API_KEY to .env
npm install
npm run dev
```

The API starts at `http://localhost:3001`.

### Start the web app

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** and start with a PDF resume plus a job description.

---

## 🔐 Privacy & security

| Default behavior | Why it matters |
| :--- | :--- |
| Resume-derived data stays in memory | Sensitive resume content is not stored by default. |
| Dashboard uses browser storage | Saved analyses stay in the current browser. |
| CORS uses an allowlist | Set the production frontend in `CORS_ORIGINS`. |
| API requests are rate-limited | Helps protect Gemini usage and the API. |

> [!WARNING]
> Enable `PERSIST_ANALYSES=true` only after adding accounts, record ownership checks, and data retention/deletion controls. The dashboard PIN is a local browser lock, not cloud authentication.

---

## ⚙️ Configuration

Create `backend/.env` from `backend/.env.example`.

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | — | Required Gemini API key |
| `PORT` | `3001` | Backend port |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed browser origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate-limit window |
| `RATE_LIMIT_MAX_REQUESTS` | `30` | Requests allowed per IP per window |
| `PERSIST_ANALYSES` | `false` | Enables optional PostgreSQL persistence |
| `DATABASE_URL` | empty | PostgreSQL connection string |
| `SCORE_WEIGHT_SEMANTIC` | `0.35` | Semantic signal weight |
| `SCORE_WEIGHT_LLM` | `0.45` | LLM signal weight |
| `SCORE_WEIGHT_SKILL` | `0.20` | Explicit-skill signal weight |

For another API host, add this to `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🔌 API at a glance

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/resume/parse` | Extract text from a PDF resume |
| `POST` | `/api/matching/analyze` | Generate the match analysis |
| `POST` | `/api/semantic-match` | Return semantic evidence and a composite score |
| `POST` | `/api/career-plan` | Generate an improvement plan |
| `POST` | `/api/resume/tailor` | Generate ATS-tailoring suggestions |
| `POST` | `/api/chat` | Ask the grounded career assistant |

---

## 🧪 Quality checks

```bash
cd backend
npm run lint
npx ts-node src/tests/semanticMatching.test.ts
npx ts-node src/tests/careerPlan.test.ts
npx ts-node src/tests/careerChat.test.ts

cd ../frontend
npm run lint
```

The backend suites cover chunking, cosine similarity, scoring, career plan validation, and chat context construction.

---

<div align="center">

Built for more confident applications. ✦

**Start analyzing →**

MIT License

</div>
