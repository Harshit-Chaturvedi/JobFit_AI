# JobFit AI

**AI-powered resume analysis and job matching.**

Upload your resume, paste a job description, and get an instant analysis of how well you fit the role — with actionable recommendations to improve your chances.

---

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS (App Router) |
| Backend  | Node.js, Express.js, TypeScript         |

## Project Structure

```
JobFit/
├── frontend/          # Next.js application
│   ├── src/
│   │   └── app/       # App Router pages
│   ├── .env.example
│   └── package.json
├── backend/           # Express API server
│   ├── src/
│   │   ├── config/    # Environment configuration
│   │   └── routes/    # API route handlers
│   ├── .env.example
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

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
npm install
npm run dev
```

The API server runs at [http://localhost:3001](http://localhost:3001).

#### Health Check

```bash
curl http://localhost:3001/api/health
```

Response:

```json
{
  "status": "ok",
  "service": "JobFit AI Backend",
  "timestamp": "2026-09-30T12:00:00.000Z"
}
```

## Planned Features

- [ ] Resume PDF upload & parsing
- [ ] Job description analysis
- [ ] AI-powered job matching with LLM integration
- [ ] Skill gap identification
- [ ] Embeddings & vector database for semantic matching
- [ ] PostgreSQL database for persistence
- [ ] AI career assistant chatbot
- [ ] User authentication
- [ ] Dashboard with match history

## Environment Variables

Copy `.env.example` to `.env` in both `frontend/` and `backend/` directories. See each file for available configuration options.

> **Note:** Never commit `.env` files. API keys and secrets must stay out of version control.

## License

MIT
