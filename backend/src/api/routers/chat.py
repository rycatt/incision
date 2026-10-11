import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types

from ..models import ChatReply, ChatRequest

GEMINI_MODEL = "gemini-3.5-flash-lite"
CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"
MAX_HISTORY = 6

SYSTEM_PROMPT = """You are the lab TA in Incision, a virtual dissection app. A student is dissecting a 3D {model}.
Answer like a sharp, relaxed TA: direct, accurate, 2-4 sentences, plain text, no markdown.
Start with the answer. No "Great question!" openers or closing offers.
Mention where things are on the model or how the {model} differs from humans when useful.
If unsure, say so. If off-topic, redirect to the dissection in one sentence.{selection}"""

client = genai.Client()

router = APIRouter(tags=["chat"])


def get_part_info(model: str, selected_part: Optional[str]) -> Optional[dict]:
    """Find the selected part in the model's content JSON, by key or by label."""
    if not selected_part:
        return None
    file = CONTENT_DIR / f"{model}.json"
    if not file.is_file():
        return None
    try:
        parts = json.loads(file.read_text()).get("parts", {})
    except json.JSONDecodeError:
        return None

    if selected_part in parts:
        return parts[selected_part]
    wanted = selected_part.strip().lower()
    for info in parts.values():
        if info.get("label", "").strip().lower() == wanted:
            return info
    return None


def build_system_prompt(model: str, selected_part: Optional[str], part_info: Optional[dict]) -> str:
    selection = ""
    if selected_part:
        selection = f'\nThe student has "{selected_part}" selected, so "this" or "it" likely means that part.'
        if part_info:
            selection += (
                f'\nReference notes for {part_info.get("label", selected_part)}: {part_info.get("description", "")}'
                "\nBase your answer on these notes and don't contradict them."
            )
    return SYSTEM_PROMPT.format(model=model, selection=selection).strip()


@router.post("/chat", response_model=ChatReply)
def chat(req: ChatRequest):
    if req.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="The last message must be from the user")

    model = req.model.strip()
    part_info = get_part_info(model.lower(), req.selected_part)

    recent = req.messages[-MAX_HISTORY:]
    contents = [
        types.Content(role=message.role, parts=[types.Part(text=message.text)])
        for message in recent
    ]

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=build_system_prompt(model, req.selected_part, part_info),
                temperature=0.4,
                max_output_tokens=250,
            ),
        )
    except Exception:
        raise HTTPException(status_code=502, detail="The assistant is unavailable right now")

    reply = (response.text or "").strip()
    if not reply:
        raise HTTPException(status_code=502, detail="The assistant returned an empty reply")

    return ChatReply(reply=reply)