

from langchain.tools import tool
import math
from typing import List, Dict, Any


def sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))


def compute_evidence_quality(evidence: Dict[str, Any]) -> float:
    """
    Simple heuristic quality score (0 → 1)
    """

    score = 0.5  # base

    # EXIF / metadata bonus
    if evidence.get("metadata"):
        score += 0.2

    # hash integrity bonus
    if evidence.get("hash_file"):
        score += 0.2

    # type weighting
    type_bonus = {
        "video": 0.1,
        "image": 0.1,
        "audio": 0.15,
        "text": 0.05
    }

    score += type_bonus.get(evidence.get("type"), 0)

    return min(1.0, score)


STANCE_MAP = {
    "support": 1,
    "contest": -1,
    "invariant": 0
}


@tool
def compute_claim_confidence(
    claim: Dict[str, Any],
    evidences: List[Dict[str, Any]],
    claim_evidences: List[Dict[str, Any]],
    rules: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes confidence score for a claim based on evidences + rules + stance.
    """

    rule_map = {r["id"]: r for r in rules}
    evidence_map = {e["id"]: e for e in evidences}

    total = 0.0
    explanation = []

    for ce in claim_evidences:

        evidence = evidence_map.get(ce["evidence_id"])
        rule = rule_map.get(ce["rule_id"])

        if not evidence or not rule:
            continue

        stance_weight = STANCE_MAP.get(ce["stance"], 0)
        rule_weight = rule.get("weight", 1.0)
        quality = compute_evidence_quality(evidence)
        modifier = ce.get("score_modifier", 1.0)

        contribution = stance_weight * rule_weight * modifier * quality

        total += contribution

        explanation.append({
            "evidence_id": ce["evidence_id"],
            "contribution": contribution,
            "stance": ce["stance"]
        })

    confidence = sigmoid(total)

    # Verdict logic
    if confidence > 0.8:
        status = "True"
    elif confidence > 0.6:
        status = "ProbablyTrue"
    elif confidence > 0.4:
        status = "Contested"
    elif confidence > 0.2:
        status = "False"
    else:
        status = "Unverifiable"

    return {
        "claim_id": claim["id"],
        "confidence_score": round(confidence, 4),
        "status": status,
        "details": explanation
    }