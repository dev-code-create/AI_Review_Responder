# agent_service/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from agent import draft_reply

app = FastAPI()

class DraftRequest(BaseModel):
    business_id: str
    review_text: str
    rating: int
    platform: str = "google"

@app.post("/draft-reply")
def draft(req: DraftRequest):
    reply = draft_reply(req.business_id, req.review_text, req.rating, req.platform)
    return {"draft": reply}