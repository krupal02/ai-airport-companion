from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from Backend.Chatbot import ChatBot
from Backend.TTS import TTS

app = FastAPI()

# Add CORS middleware for local dev (Vite uses 5173, FastAPI uses 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot = ChatBot()
tts = TTS()

from typing import Optional

class ChatRequest(BaseModel):
    query: str
    user_profile: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    print(f"Received query: {request.query} from profile: {request.user_profile} at {request.latitude},{request.longitude}")
    
    # Get response from Chatbot
    response_text = chatbot.get_response(request.query, request.user_profile, request.latitude, request.longitude)
    
    # Trigger TTS voice
    tts.speak(response_text)
    
    return {"response": response_text}

# Mount the static files from the React dist folder if it exists
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Make sure to run `npm run build` first to create the dist folder
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
