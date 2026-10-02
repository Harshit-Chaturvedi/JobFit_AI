# JobFit AI

**AI-powered resume analysis and job matching.**

Upload your resume, paste a job description, and get an instant analysis of how well you fit the role — with actionable recommendations to improve your chances.

---

## Features

### ✅ Resume Match Analysis
Upload your resume and a job description to get:
- **Match Score** — how well your profile fits the role (0–100%)
- **Matching Skills** — skills you already have that the job requires
- **Missing Skills** — skills required by the job but not found in your resume
- **Relevant Experience** — experience from your resume relevant to the role
- **Strengths & Improvements** — what you're strong at and where to improve

### 🚀 Candidate Improvement Plan *(New)*
After the match analysis, generate a personalized improvement plan:
- **Candidate Summary** — overview statement, top strength, biggest gap, and recommended next step
- **Missing Skills Analysis** — detailed breakdown of each missing skill with importance level, learning difficulty, and specific recommendations
- **Resume Improvement** — skills to highlight, relevant projects to emphasize, keywords to mention, and project description suggestions (never fabricates experience)
- **Project Recommendations** — 2–3 realistic project ideas connected to the target role with technologies, difficulty level, and estimated time
- **Learning Roadmap** — prioritized learning path divided into Must Learn, Should Learn, and Nice to Have

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
│   │   │   ├── AnalysisResults.tsx
│   │   │   └── CareerPlanResults.tsx  # NEW — Improvement plan UI
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
│   │   │   ├── matchingController.ts
│   │   │   └── careerPlanController.ts  # NEW
│   │   ├── middleware/
│   │   │   └── upload.ts        # Multer file upload config
│   │   ├── routes/
│   │   │   ├── health.ts
│   │   │   ├── resume.ts
│   │   │   ├── matching.ts
│   │   │   └── careerPlan.ts    # NEW
│   │   ├── services/
│   │   │   ├── aiService.ts     # LLM integration (match analysis)
│   │   │   └── careerPlanService.ts  # NEW — Improvement plan AI
│   │   ├── tests/
│   │   │   └── careerPlan.test.ts  # NEW — Validation tests
│   │   ├── types/
│   │   │   ├── analysis.ts      # Match analysis types
│   │   │   └── careerPlan.ts    # NEW — Career plan types
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

| Method | Endpoint               | Description                            |
| ------ | ---------------------- | -------------------------------------- |
| GET    | `/api/health`          | Health check                           |
| POST   | `/api/resume/parse`    | Upload & extract text from PDF         |
| POST   | `/api/matching/analyze`| Analyze resume against job posting     |
| POST   | `/api/career-plan`     | Generate candidate improvement plan    |

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

### `POST /api/career-plan`

Generate a personalized candidate improvement plan based on the match analysis.

- **Content-Type:** `application/json`
- **Request body:**
```json
{
  "resumeText": "extracted resume text...",
  "jobDescription": "paste the job posting here...",
  "analysis": {
    "matchScore": 78,
    "summary": "...",
    "matchingSkills": ["Python", "SQL"],
    "missingSkills": ["TypeScript", "React"],
    "matchingExperience": ["..."],
    "missingRequirements": ["..."],
    "strengths": ["..."],
    "improvements": ["..."]
  }
}
```
- **Response:**
```json
{
  "candidateSummary": {
    "overviewStatement": "You are a strong match in backend development, but...",
    "currentMatchScore": 78,
    "topStrength": "Strong backend skills with Python and SQL",
    "biggestGap": "No frontend framework experience",
    "recommendedNextStep": "Start learning React and build a small project"
  },
  "missingSkillsAnalysis": [
    {
      "skillName": "React",
      "importance": "High",
      "reason": "The job requires React for frontend development.",
      "learningDifficulty": "Requires deep preparation",
      "recommendation": "Build at least one React project and understand components, hooks and API integration."
    }
  ],
  "resumeImprovement": {
    "skillsToHighlight": ["Python", "SQL", "REST APIs"],
    "relevantProjects": ["Backend API project"],
    "keywordsToMention": ["microservices", "CI/CD"],
    "sectionsToImprove": ["Add a technical skills section"],
    "projectDescriptionSuggestions": ["Add metrics to your API project description"]
  },
  "projectRecommendations": [
    {
      "title": "Full-Stack Task Manager",
      "problem": "Need to demonstrate frontend and backend skills together",
      "description": "Build a task management app with React frontend and Python/Node.js backend",
      "technologies": ["React", "TypeScript", "Node.js", "PostgreSQL"],
      "skillsCovered": ["React", "TypeScript", "Full-Stack Development"],
      "difficulty": "Intermediate",
      "estimatedTime": "2-3 weeks"
    }
  ],
  "learningRoadmap": {
    "mustLearn": [
      { "topic": "React", "reason": "Core frontend framework required", "suggestedOrder": 1 }
    ],
    "shouldLearn": [
      { "topic": "TypeScript", "reason": "Used across the codebase", "suggestedOrder": 1 }
    ],
    "niceToHave": [
      { "topic": "Docker", "reason": "Deployment tooling", "suggestedOrder": 1 }
    ]
  }
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

## How to Test

### Manual Testing (Full Flow)

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)
4. Click **"Analyze My Resume"**
5. Upload a PDF resume
6. Paste a job description
7. Click **"Analyze My Match"**
8. View your match score, matching/missing skills, and improvement suggestions
9. Click **"Generate My Improvement Plan"**
10. View your personalized action plan with skills analysis, resume tips, project ideas, and learning roadmap

### Automated Tests (Validation)

Run the career plan validation tests:

```bash
cd backend
npx ts-node src/tests/careerPlan.test.ts
```

Tests cover:
- Strong candidate with complete AI response
- Weak candidate with many missing skills
- Candidate with projects but little professional experience
- Completely empty/invalid AI response (crash safety)
- Null/undefined input (crash safety)
- Invalid enum values (default handling)
- Partial response with missing sections

## Planned Features

- [ ] Embeddings & vector database for semantic matching
- [ ] PostgreSQL database for persistence
- [ ] AI career assistant chatbot
- [ ] User authentication
- [ ] Dashboard with match history
- [ ] Multiple LLM provider support

## License

MIT
