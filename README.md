# JobFit AI

**AI-powered resume analysis, semantic job matching, and candidate improvement.**

Upload your resume, paste a job description, and get instant multi-layer matching — combining semantic vector search, LLM reasoning, and explicit skill verification — with actionable recommendations to maximize your hiring fit.

---

## Features

### 🔍 Semantic Matching & Vector Search *(New)*
Move beyond basic keyword searching with an embedding-driven semantic layer:
- **Vector Embeddings** — Documents are chunked into logical sections and embedded using `text-embedding-004` (768 dimensions).
- **PostgreSQL + pgvector** — Efficient similarity search using cosine distance (`<=>`) with database indexing.
- **Requirement Evidence Matching** — Maps each job requirement to relevant resume excerpts with similarity percentages.
- **Composite Scoring** — Transparently blends vector similarity (35%), LLM analysis (45%), and explicit skill presence (20%).
- **Graceful Fallback** — Operates seamlessly with in-memory vector comparison if PostgreSQL is offline, preserving existing LLM analysis.

### ✅ Resume Match Analysis
- **Match Score** — Overall fit percentage (0–100%)
- **Matching Skills** — Skills found in resume that match the job posting
- **Missing Skills** — Skills required by the job but absent from the resume
- **Relevant Experience** — Work history highlights aligning with the role
- **Strengths & Improvements** — Key advantages and specific areas to target

### 🚀 Candidate Improvement Plan
- **Candidate Summary** — Executive overview, top strength, biggest gap, and next step
- **Missing Skills Breakdown** — Importance level (High/Medium/Low), learning effort, and target actions
- **Resume Improvement** — Role-grounded bullet optimizations without fabricating experience
- **Target Project Ideas** — 2–3 portfolio projects bridging profile gaps
- **Learning Roadmap** — Three-tier prioritized timeline (Must Learn, Should Learn, Nice to Have)

---

## Architecture: How Semantic Matching Works

```
Resume PDF                             Job Description
    ↓                                         ↓
Extract Text                           Extract Sections & Requirements
    ↓                                         ↓
Section Chunking                       Section & Item Chunking
(Summary, Skills, Exp, Education)      (Responsibilities, Skills, Quals)
    ↓                                         ↓
Generate Embeddings                    Generate Embeddings
(text-embedding-004)                   (text-embedding-004)
    ↓                                         ↓
PostgreSQL + pgvector                  Vector Comparison
(Persisted with metadata)              (Cosine Similarity)
    └──────────────────────┬──────────────────┘
                           ↓
                Semantic Match Score (35%)
                + LLM Analysis Score (45%)
                + Explicit Skill Match (20%)
                           ↓
                  Final Composite Score
```

### Why Embeddings & Vector Search?
Traditional resume screeners rely on keyword counts. If a resume says *"Built distributed backend APIs in Go"* and the job requires *"Server-side microservice architecture"*, keyword search finds 0 matches despite near-identical experience. Embeddings capture semantic meaning in high-dimensional vector space, measuring conceptual alignment.

### Keyword Matching vs. Semantic Matching
- **Keyword Matching**: Fast and literal, but brittle against synonyms, phrasing differences, and abbreviations.
- **Semantic Matching**: Understands context, related concepts, and domain equivalence.
- **JobFit AI's Hybrid Rule**: *Semantic similarity provides supporting evidence, not proof.* Explicit skill claims in the resume remain the source of truth for claimed qualifications.

### Why pgvector?
- **Unified Stack**: Eliminates the operational overhead of a standalone vector database (Pinecone, Qdrant, etc.) by running vector search directly in PostgreSQL alongside relational data (`resumes`, `job_descriptions`, `analyses`).
- **ACID Transactions**: Enables atomic transactions between document chunks, vector embeddings, and analysis metadata.
- **Familiar SQL**: Queries use standard SQL with vector operators (`<=>` for cosine distance).

### Score Calculation Formula
The final score is computed as a weighted linear combination:

$$\text{Final Score} = (\text{Semantic Score} \times 0.35) + (\text{LLM Score} \times 0.45) + (\text{Skill Match Score} \times 0.20)$$

Where:
- **Semantic Score (35%)**: Average cosine similarity of job requirements matched against resume sections.
- **LLM Score (45%)**: Qualitative fit assessed by Gemini 2.0 Flash considering depth, experience level, and role alignment.
- **Skill Match Score (20%)**: Explicit keyword ratio: $\frac{\text{matchingSkills}}{\text{matchingSkills} + \text{missingSkills}} \times 100$.

*All weights are configurable via environment variables (`SCORE_WEIGHT_SEMANTIC`, `SCORE_WEIGHT_LLM`, `SCORE_WEIGHT_SKILL`).*

---

## Tech Stack

| Layer             | Technology                                                       |
| ----------------- | ---------------------------------------------------------------- |
| **Frontend**      | Next.js 16, React, TypeScript, Tailwind CSS (App Router)         |
| **Backend**       | Node.js, Express.js, TypeScript                                 |
| **Database**      | PostgreSQL 15+ with `pgvector` extension                         |
| **Embeddings**    | Google Gemini `text-embedding-004` (768 dimensions)              |
| **LLM Reasoning** | Google Gemini 2.0 Flash (via `@google/generative-ai`)            |
| **PDF Extraction**| `pdf-parse` v2                                                  |

---

## Project Structure

```
JobFit/
├── frontend/                          # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Landing page
│   │   │   └── analyze/
│   │   │       └── page.tsx           # Multi-stage analysis dashboard
│   │   ├── components/
│   │   │   ├── ResumeUpload.tsx
│   │   │   ├── JobDescriptionInput.tsx
│   │   │   ├── AnalysisResults.tsx    # LLM analysis UI
│   │   │   ├── SemanticMatchResults.tsx # Semantic vector search UI
│   │   │   └── CareerPlanResults.tsx  # Career plan roadmap UI
│   │   ├── lib/
│   │   │   └── api.ts                 # Typed API client
│   │   └── types/
│   │       └── analysis.ts            # Shared frontend types
│   ├── .env.example
│   └── package.json
│
├── backend/                           # Express API server
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts                 # App & database configuration
│   │   ├── controllers/
│   │   │   ├── resumeController.ts
│   │   │   ├── matchingController.ts
│   │   │   ├── careerPlanController.ts
│   │   │   └── semanticController.ts  # Semantic match controller
│   │   ├── middleware/
│   │   │   └── upload.ts              # Multer PDF upload configuration
│   │   ├── routes/
│   │   │   ├── health.ts
│   │   │   ├── resume.ts
│   │   │   ├── matching.ts
│   │   │   ├── careerPlan.ts
│   │   │   └── semantic.ts            # Semantic match routes
│   │   ├── services/
│   │   │   ├── aiService.ts           # Gemini LLM match reasoning
│   │   │   ├── careerPlanService.ts   # Career plan generation
│   │   │   ├── chunkingService.ts     # Intelligent section chunking
│   │   │   ├── embeddingService.ts    # text-embedding-004 & cosine math
│   │   │   ├── databaseService.ts     # PostgreSQL + pgvector connection pool
│   │   │   ├── semanticMatchingService.ts # Vector search & evidence extraction
│   │   │   └── matchScoringService.ts # Weighted composite scoring
│   │   ├── tests/
│   │   │   ├── careerPlan.test.ts     # Career plan test suite
│   │   │   └── semanticMatching.test.ts # Vector search & chunking test suite
│   │   ├── types/
│   │   │   ├── analysis.ts            # LLM analysis types
│   │   │   ├── careerPlan.ts          # Improvement plan types
│   │   │   └── semantic.ts            # Vector & database types
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)
- *(Optional)* **PostgreSQL with pgvector** (e.g., via Docker or Supabase/Neon)

### Database Setup (Optional for Persistence & Accelerated Search)

You can run PostgreSQL with pgvector locally using Docker:

```bash
docker run -d \
  --name jobfit-pgvector \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=jobfit \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

Or enable pgvector in an existing PostgreSQL instance:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

*Note: If `DATABASE_URL` is omitted, JobFit AI automatically runs in-memory vector matching so you can test all features without running a database.*

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and supply GEMINI_API_KEY (and optional DATABASE_URL)
npm install
npm run dev
```

Server starts on [http://localhost:3001](http://localhost:3001).

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                 | Required | Default                   | Description                                    |
| ------------------------ | -------- | ------------------------- | ---------------------------------------------- |
| `PORT`                   | No       | `3001`                    | Server port                                    |
| `NODE_ENV`               | No       | `development`             | Environment                                    |
| `GEMINI_API_KEY`         | **Yes**  | —                         | Google Gemini API key                          |
| `DATABASE_URL`           | No       | `""`                      | PostgreSQL connection string (`postgresql://`)|
| `EMBEDDING_MODEL`        | No       | `text-embedding-004`      | Embedding model name                           |
| `EMBEDDING_DIMENSION`    | No       | `768`                     | Vector dimensions                              |
| `SCORE_WEIGHT_SEMANTIC`  | No       | `0.35`                    | Semantic similarity weight (35%)               |
| `SCORE_WEIGHT_LLM`       | No       | `0.45`                    | LLM analysis weight (45%)                      |
| `SCORE_WEIGHT_SKILL`     | No       | `0.20`                    | Skill match weight (20%)                       |

### Frontend (`frontend/.env`)

| Variable                | Required | Default                    | Description         |
| ----------------------- | -------- | -------------------------- | ------------------- |
| `NEXT_PUBLIC_API_URL`   | No       | `http://localhost:3001/api`| Backend API base URL|

---

## API Endpoints

| Method | Endpoint                | Description                                       |
| ------ | ----------------------- | ------------------------------------------------- |
| `GET`  | `/api/health`           | Health check                                      |
| `POST` | `/api/resume/parse`     | Upload and extract plain text from PDF resume     |
| `POST` | `/api/matching/analyze` | LLM-based resume match analysis                   |
| `POST` | `/api/semantic-match`   | **(New)** Vector embedding similarity & composite score |
| `POST` | `/api/career-plan`      | Personalized candidate improvement plan           |

### `POST /api/semantic-match`

Performs vector search comparing resume chunks against job requirements.

- **Request Body (Direct Text or Database IDs):**
```json
{
  "resumeText": "Extracted resume text...",
  "jobDescription": "Job posting text...",
  "llmAnalysis": {
    "matchScore": 82,
    "matchingSkills": ["Node.js", "PostgreSQL"],
    "missingSkills": ["Docker"]
  }
}
```

- **Response:**
```json
{
  "semanticScore": 84,
  "finalScore": 81,
  "scoreBreakdown": {
    "semanticScore": 84,
    "llmScore": 82,
    "skillMatchScore": 67,
    "finalScore": 81,
    "weights": {
      "semantic": 0.35,
      "llm": 0.45,
      "skillMatch": 0.20
    }
  },
  "matchedRequirements": [
    {
      "requirement": "Proficiency with Node.js and REST APIs",
      "matchedContent": "Engineered REST microservices in Node.js...",
      "similarity": 0.88,
      "chunkType": "experience"
    }
  ],
  "unmatchedRequirements": [
    "Experience deploying containers to Kubernetes"
  ],
  "evidence": [
    {
      "requirement": "Proficiency with Node.js and REST APIs",
      "resumeExcerpt": "Engineered REST microservices in Node.js...",
      "similarity": 0.88,
      "sourceSection": "experience"
    }
  ],
  "resumeId": "b1836e2f-...",
  "jobDescriptionId": "c4932a1e-..."
}
```

---

## Running Automated Tests

Run the backend test suites verifying chunking, vector math, fallback handling, and scoring:

```bash
cd backend

# Run Semantic Matching & Vector Search tests (46 assertions)
npx ts-node src/tests/semanticMatching.test.ts

# Run Candidate Improvement Plan tests (54 assertions)
npx ts-node src/tests/careerPlan.test.ts
```

All 100 tests run self-contained and execute in under 3 seconds without external dependencies.

---

## License

MIT
