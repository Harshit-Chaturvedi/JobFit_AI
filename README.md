# JobFit AI

**AI-powered resume analysis and job matching.**

Upload your resume, paste a job description, and get an instant analysis of how well you fit the role — with actionable recommendations to improve your chances.

---

## Tech Stack

| Layer    | Technology                                               |
| -------- | -------------------------------------------------------- |
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS (App Router) |
| Backend  | Node.js, Express.js, TypeScript                          |
| AI       | Google Gemini 2.0 Flash (via `@google/generative-ai`)    |
| PDF      | pdf-parse v2                                             |

## Project Structure

```
JobFit/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Landing page
│   │   │   └── analyze/
│   │   │       └── page.tsx     # Resume analysis page
│   │   ├── components/
│   │   │   ├── ResumeUpload.tsx
│   │   │   ├── JobDescriptionInput.tsx
│   │   │   └── AnalysisResults.tsx
│   │   ├── lib/
│   │   │   └── api.ts           # API client
│   │   └── types/
│   │       └── analysis.ts      # Shared TypeScript types
│   ├── .env.example
│   └── package.json
│
├── backend/                     # Express API server
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts           # Environment configuration
│   │   ├── controllers/
│   │   │   ├── resumeController.ts
│   │   │   └── matchingController.ts
│   │   ├── middleware/
│   │   │   └── upload.ts        # Multer file upload config
│   │   ├── routes/
│   │   │   ├── health.ts
│   │   │   ├── resume.ts
│   │   │   └── matching.ts
│   │   ├── services/
│   │   │   └── aiService.ts     # LLM integration (swappable)
│   │   ├── types/
│   │   │   └── analysis.ts      # Shared TypeScript types
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm run dev
```

The API server runs at [http://localhost:3001](http://localhost:3001).

## API Endpoints

| Method | Endpoint               | Description                        |
| ------ | ---------------------- | ---------------------------------- |
| GET    | `/api/health`          | Health check                       |
| POST   | `/api/resume/parse`    | Upload & extract text from PDF     |
| POST   | `/api/matching/analyze`| Analyze resume against job posting |

### `POST /api/resume/parse`

Upload a PDF resume for text extraction.

- **Content-Type:** `multipart/form-data`
- **Field:** `resume` (PDF file, max 5MB)
- **Response:**
```json
{
  "text": "extracted resume text...",
  "pages": 2,
  "filename": "resume.pdf"
}
```

### `POST /api/matching/analyze`

Analyze how well a resume matches a job description.

- **Content-Type:** `application/json`
- **Request body:**
```json
{
  "resumeText": "extracted resume text...",
  "jobDescription": "paste the job posting here..."
}
```
- **Response:**
```json
{
  "matchScore": 78,
  "summary": "Your profile is a good match...",
  "matchingSkills": ["Python", "SQL"],
  "missingSkills": ["TypeScript", "React"],
  "matchingExperience": ["3 years backend development"],
  "missingRequirements": ["Frontend framework experience"],
  "strengths": ["Strong backend skills"],
  "improvements": ["Learn a modern frontend framework"]
}
```

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Required | Description                      |
| --------------- | -------- | -------------------------------- |
| `PORT`          | No       | Server port (default: 3001)      |
| `NODE_ENV`      | No       | Environment (default: development) |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key            |

### Frontend (`frontend/.env`)

| Variable               | Required | Description                          |
| ---------------------- | -------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL`  | No       | Backend API URL (default: http://localhost:3001/api) |

## How to Test the Resume Analysis Flow

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)
4. Click **"Analyze My Resume"**
5. Upload a PDF resume
6. Paste a job description
7. Click **"Analyze My Match"**
8. View your match score, matching/missing skills, and improvement suggestions

## Planned Features

- [ ] Embeddings & vector database for semantic matching
- [ ] PostgreSQL database for persistence
- [ ] AI career assistant chatbot
- [ ] User authentication
- [ ] Dashboard with match history
- [ ] Multiple LLM provider support

## License

MIT
