import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import chat, content

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip().rstrip("/") for origin in allowed_origins if origin.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/api")
def root():
    return {"message": "Backend is running"}
