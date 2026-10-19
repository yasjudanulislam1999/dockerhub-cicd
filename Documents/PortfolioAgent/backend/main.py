import json
import os
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Portfolio Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

with open("candidate.json", "r") as f:
    CANDIDATE = json.load(f)


# --------------------------------------------------------------------------- #
# Pydantic models
# --------------------------------------------------------------------------- #

class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    job_description: Optional[str] = None


# --------------------------------------------------------------------------- #
# System prompt builder
# --------------------------------------------------------------------------- #

def build_system_prompt(candidate: dict, job_description: str = None) -> str:
    skills = candidate.get("skills", {})
    skills_str = "\n".join(
        f"  {category}: {', '.join(items)}"
        for category, items in skills.items()
    )

    projects_str = "\n".join(
        f"  - {p['name']}: {p['description']} | Tech: {', '.join(p.get('tech', []))}"
        for p in candidate.get("projects", [])
    )

    experience_str = "\n".join(
        f"  - {e['role']} at {e['company']} ({e['duration']}): {e['description']}"
        for e in candidate.get("experience", [])
    )

    education_str = "\n".join(
        f"  - {e['degree']} from {e['institution']} ({e['year']}) — CGPA: {e.get('cgpa', 'N/A')}"
        for e in candidate.get("education", [])
    )

    prompt = f"""You are a professional AI representative speaking on behalf of {candidate['name']}, a {candidate['title']}.

IDENTITY & BEHAVIOUR RULES:
- Speak about the candidate in third person, using their name or "they/them".
- Never fabricate or invent facts not present in the profile below.
- If asked for information that is not in the profile, say clearly: "That information isn't in my profile — feel free to reach out directly at {candidate['email']}."
- Be enthusiastic, honest, and concise.
- Redirect hostile or off-topic questions politely back to professional topics.
- Do not speculate about salary expectations unless explicitly stated in the profile.

CANDIDATE PROFILE:
Name:       {candidate['name']}
Title:      {candidate['title']}
Location:   {candidate.get('location', 'Not specified')}
Email:      {candidate['email']}
Phone:      {candidate.get('phone', 'Not specified')}
LinkedIn:   {candidate.get('linkedin', 'N/A')}
GitHub:     {candidate.get('github', 'N/A')}

EDUCATION:
{education_str}

SKILLS:
{skills_str}

EXPERIENCE:
{experience_str}

PROJECTS:
{projects_str}

CERTIFICATIONS: {', '.join(candidate.get('certifications', []))}
ACHIEVEMENTS:   {', '.join(candidate.get('achievements', []))}
LANGUAGES:      {', '.join(candidate.get('languages_spoken', []))}
"""

    if job_description:
        prompt += f"""

JOB DESCRIPTION ANALYSIS MODE:
A recruiter has provided the following job description. Analyse how well {candidate['name']} matches it.

---JOB DESCRIPTION---
{job_description}
---END JOB DESCRIPTION---

Structure your analysis as:
1. Match Score — Strong Match / Partial Match / Growth Opportunity
2. Matching Skills & Experience (bullet list)
3. Skill gaps or areas still developing (be honest)
4. Why {candidate['name']} would still be a strong hire (always end positively)
"""

    return prompt


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/candidate")
async def get_candidate():
    return CANDIDATE


@app.post("/chat")
async def chat(request: ChatRequest):
    system_prompt = build_system_prompt(CANDIDATE, request.job_description)

    groq_messages = [{"role": "system", "content": system_prompt}]
    groq_messages += [
        {"role": m.role, "content": m.content}
        for m in request.messages
    ]

    # Sync generator — do NOT make async; Groq sync client is not awaitable.
    # FastAPI/Starlette runs sync generators in a threadpool automatically.
    def stream_generator():
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=groq_messages,
            stream=True,
        )
        for chunk in completion:
            delta = chunk.choices[0].delta.content
            if delta is not None:
                yield delta

    return StreamingResponse(stream_generator(), media_type="text/plain")
