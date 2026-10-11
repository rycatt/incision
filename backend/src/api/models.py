from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class PartInfo(BaseModel):
    label: str
    description: str


class PartGroup(BaseModel):
    id: str
    label: str
    members: List[str] = []


class TourStep(BaseModel):
    title: str
    body: str
    targets: List[str] = []


class ModelContent(BaseModel):
    parts: Dict[str, PartInfo] = {}
    groups: List[PartGroup] = []
    tour: List[TourStep] = []


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    text: str = Field(min_length=1, max_length=1000)


class ChatRequest(BaseModel):
    model: str = Field(min_length=1, max_length=50)
    messages: List[ChatMessage] = Field(min_length=1, max_length=20)
    selected_part: Optional[str] = Field(default=None, max_length=100)


class ChatReply(BaseModel):
    reply: str
