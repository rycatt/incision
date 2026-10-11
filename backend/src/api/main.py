from dotenv import load_dotenv
load_dotenv()

from typing import List, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

GEMINI_MODEL = "gemini-3.5-flash-lite"

SYSTEM_PROMPT = """You are a friendly anatomy tutor inside a virtual dissection app.
The student is exploring a 3D model of a {model}.

- Answer questions about the {model}'s anatomy, organs, body systems, and biology.
- Keep answers short: 2-4 sentences and under 120 words.
- Write plain text only, with no markdown, bullet symbols, or headings.
- If a question is unrelated to the {model} or biology, politely steer the student back to the {model}.
{selection}"""

app = FastAPI()
client = genai.Client()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    text: str = Field(min_length=1, max_length=1000)


class ChatRequest(BaseModel):
    model: str = Field(min_length=1, max_length=50)
    messages: List[ChatMessage] = Field(min_length=1, max_length=20)
    selected_part: Optional[str] = Field(default=None, max_length=100)


class ChatReply(BaseModel):
    reply: str


def build_system_prompt(model: str, selected_part: Optional[str]) -> str:
    selection = (
        f'- The student currently has the "{selected_part}" selected, so "this" or "it" likely refers to it.'
        if selected_part
        else ""
    )
    return SYSTEM_PROMPT.format(model=model, selection=selection).strip()


@app.get("/")
def root():
    return {"message": "Backend is running"}


@app.post("/chat", response_model=ChatReply)
def chat(req: ChatRequest):
    if req.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="The last message must be from the user")

    contents = [
        types.Content(role=message.role, parts=[types.Part(text=message.text)])
        for message in req.messages
    ]

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=build_system_prompt(req.model.strip(), req.selected_part),
                temperature=0.4,
            ),
        )
    except Exception:
        raise HTTPException(status_code=502, detail="The assistant is unavailable right now")

    reply = (response.text or "").strip()
    if not reply:
        raise HTTPException(status_code=502, detail="The assistant returned an empty reply")

    return ChatReply(reply=reply)
