from fastapi import FastAPI
from AImodel.schemas import QueryRequest, ResearchResponse
from AImodel.agent import run_agent

app = FastAPI(
    title="Claim Extraction API",
    description="Break text into atomic claims using LangChain agent",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "API is running"}

@app.post("/analyze", response_model=ResearchResponse)
def analyze(request: QueryRequest):
    result = run_agent(request.query)
    return result["output"]


from langchain.tools import tool
import whisper

model = whisper.load_model("base")

@tool
def transcribe_audio(audio_path: str) -> str:
    """
    Convert audio → text transcript
    """

    result = model.transcribe(audio_path)
    return result["text"]




""# tools/ocr.py
import easyocr
from langchain.tools import tool
import os

reader = easyocr.Reader(['en'])

@tool
def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image using EasyOCR.
    """

    if not os.path.exists(image_path):
        return "File not found."

    results = reader.readtext(image_path, detail=0)
    text = " ".join(results)

    return text.strip() if text else "No readable text found."""