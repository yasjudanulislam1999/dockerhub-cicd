# Portfolio Agent

An AI-powered chatbot that acts as your personal portfolio representative. HR teams and recruiters can ask it anything about the candidate — skills, projects, experience — and even paste a job description to get an automated fit analysis.

![Portfolio Agent Screenshot](screenshot.png)

---

## Features

- **Streaming responses** — answers appear word-by-word like ChatGPT
- **Conversation memory** — follows multi-turn context ("which one was hardest?")
- **Job Description matching** — paste any JD and get a structured fit analysis
- **Dark, polished UI** — full-height chat layout with auto-scroll
- **Honest AI** — never hallucates; clearly says when information isn't available

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Python, FastAPI, Groq API         |
| LLM       | Llama 3.3 70B (via Groq)          |
| Frontend  | React 18, Vite 5                  |
| Streaming | FastAPI `StreamingResponse` + Fetch ReadableStream |
| Deploy    | Render (backend), Vercel (frontend) |

---

## Prerequisites

- Python 3.9+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/portfolio-agent.git
cd portfolio-agent
```

### 2. Customise your profile

Edit `backend/candidate.json` with your real information — name, education, skills, projects, experience, etc.

### 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and paste your GROQ_API_KEY
```

Start the server:

```bash
uvicorn main:app --reload
# API running at http://localhost:8000
```

Verify:
```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

### 4. Frontend

```bash
cd ../frontend
npm install
npm run dev
# UI running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) — you should see the chat interface with a welcome message.

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set the root directory to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `GROQ_API_KEY = <your key>`

### Frontend → Vercel

1. Import the repo on [Vercel](https://vercel.com)
2. Set the root directory to `frontend/`
3. Add environment variable: `VITE_API_URL = https://your-render-app.onrender.com`
4. Update `vite.config.js` proxy target to your Render URL for production builds

---

## Environment Variables

| Variable      | Where        | Description               |
|---------------|--------------|---------------------------|
| `GROQ_API_KEY`| `backend/.env` | Your Groq API key        |

---

## Project Structure

```
PortfolioAgent/
├── backend/
│   ├── main.py           # FastAPI app — routes, streaming, system prompt
│   ├── candidate.json    # YOUR profile data — edit this!
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # State management + streaming fetch logic
│   │   ├── App.css       # Dark theme styles
│   │   └── components/
│   │       ├── ChatWindow.jsx
│   │       ├── MessageBubble.jsx
│   │       ├── InputBar.jsx
│   │       └── JobDescriptionPanel.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```
