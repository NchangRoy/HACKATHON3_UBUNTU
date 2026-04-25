from fastapi import FastAPI
from schemas import QueryRequest, ResearchResponse,ClaimRequest, ClaimResponse
from agent import run_agent,extract_claims

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

@app.post("/extract_claims")
def extract(request: ClaimRequest):

    prompt = f"""
Extract claims from the following text:

{request.text}

Remove contradictory claims and return only consistent ones.
"""

    result = run_agent(prompt)

    return {"claims": result}