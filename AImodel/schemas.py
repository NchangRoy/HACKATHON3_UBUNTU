from pydantic import BaseModel
from typing import List

class QueryRequest(BaseModel):
    query: str

class ResearchResponse(BaseModel):
    topic: str
    claims: List[str]
    summary: str
    sources: List[str]
    tools_used: List[str]

class ClaimRequest(BaseModel):
    text: str

# -------------------
# Response schema
# -------------------
class ClaimResponse(BaseModel):
    claims: List[str]