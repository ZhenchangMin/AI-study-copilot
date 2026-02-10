import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel

app = FastAPI(title="AI Study Copilot API")

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- Basic endpoints --------
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/hello")
def hello():
    return {"msg": "hello from backend"}

# -------- Echo chat (Day 2) --------
class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat(req: ChatRequest):
    return {"reply": f"You said: {req.message}"}

# -------- LLM chat via DeepSeek (Day 3) --------
class ChatLLMRequest(BaseModel):
    messages: list[dict]

@app.post("/api/chat_llm")
def chat_llm(req: ChatLLMRequest):
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        return {"reply": "Server missing DEEPSEEK_API_KEY env var."}

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.deepseek.com",
    )

    resp = client.chat.completions.create(
        model="deepseek-chat",
        messages=req.messages,
        temperature=0.7,
    )

    return {"reply": resp.choices[0].message.content}
