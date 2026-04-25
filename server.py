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