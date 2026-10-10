from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

app = FastAPI()
client = genai.Client()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PartRequest(BaseModel):
    part: str

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.post("/explain")
def explain(req: PartRequest):
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=f"In 2-3 simple sentences, explain what the {req.part} does in a frog.",
    )
    return {"text": response.text}