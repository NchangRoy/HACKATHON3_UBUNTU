from fastapi import FastAPI
from fastapi.params import Body
from AImodel.schemas import QueryRequest, ResearchResponse,ClaimRequest, ClaimResponse
from AImodel.agent import run_agent,extract_claims
from AImodel.tools import classify_and_rank_claims

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


@app.post("/score_claim")
def score_claim(payload: dict):

    result2 = run_agent({
        "claim": payload["claim"],
        "evidences": payload["evidences"],
        "claim_evidences": payload["claim_evidences"],
        "rules": payload["rules"]
    })

    return result2


@app.post("/classify_claims")
def classify_claims(payload: dict = Body(...)):
    """
    Receives list of claims and returns:
    - theme classification
    - ranked priority list
    """

    claims = payload.get("claims", [])

    if not isinstance(claims, list):
        return {"error": "claims must be a list of strings"}

    result = run_agent(f"Classify and rank the following claims:\n{claims}")

    return result