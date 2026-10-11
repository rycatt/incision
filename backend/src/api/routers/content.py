from pathlib import Path

from fastapi import APIRouter, HTTPException, Path as PathParam
from pydantic import ValidationError

from ..models import ModelContent

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"

router = APIRouter(tags=["content"])


@router.get("/models/{slug}/content", response_model=ModelContent)
def model_content(slug: str = PathParam(pattern=r"^[a-z0-9-]+$", max_length=50)):
    file = CONTENT_DIR / f"{slug}.json"
    if not file.is_file():
        return ModelContent()
    try:
        return ModelContent.model_validate_json(file.read_text())
    except ValidationError:
        raise HTTPException(status_code=500, detail=f"Content for '{slug}' is invalid")
