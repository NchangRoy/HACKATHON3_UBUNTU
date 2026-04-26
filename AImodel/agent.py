from dotenv import load_dotenv

import os
load_dotenv()



from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from  langchain_classic.agents import create_tool_calling_agent
from langchain_classic.agents import AgentExecutor
from langchain.tools import tool
from AImodel.tools import  compute_claim_confidence,classify_and_rank_claims

print(os.getenv("BASE_URL"))
llm = ChatOpenAI(
    model="openai/gpt-oss-120b",
    api_key="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",
    base_url="https://openrouter.ai/api/v1"
)


####tools####


@tool
def extract_claims(text: str) -> list[str]:
    """
    Break a complex paragraph into atomic, verifiable claims.
    Each claim should be independent and concise.
    """
    llm_prompt = f"""
    Break the following text into atomic claims.
    Each claim must:
    - Contain only ONE idea
    - Be independently verifiable
    - Avoid combining multiple effects
    

    Text:
    {text}

    Output as a Python list of strings.
    """

    response = llm.invoke(llm_prompt)
    return response.content


import json

@tool
def filter_contradictory_claims(claims: list[str]) -> list[str]:
    """
    Remove claims that contradict each other.
    Returns only non-conflicting claims.
    """

    prompt = f"""
You are a contradiction detection system.

Given a list of claims:
1. Identify pairs that contradict each other
2. Remove BOTH claims in any contradictory pair
3. Return ONLY consistent claims

Claims:
{claims}

Return as a JSON list of remaining claims only.
"""

    response = llm.invoke(prompt).content

    return json.loads(response)


class ResearchResponse(BaseModel):
    topic:str
    summary:str
    sources:list[str]
    tools_used:list[str]


parser=PydanticOutputParser(pydantic_object=ResearchResponse)

prompt=ChatPromptTemplate.from_messages(
    [
        ("system","""
            You are a research assistant that will help generate a research.
            Answer the user query and use necessary tools.
            Wrap the output in this format and provide no other text\n{format_instructions}
"""),
    ("placeholder","{chat_history}"),
    ("human","{query}"),
    ("placeholder","{agent_scratchpad}"),
    ]
).partial(format_instructions=parser.get_format_instructions())




    

agent=create_tool_calling_agent(
    llm=llm,
    prompt=prompt,
    tools=[extract_claims, filter_contradictory_claims,compute_claim_confidence,classify_and_rank_claims],
)
agent_executor=AgentExecutor(agent=agent,tools=[extract_claims, filter_contradictory_claims,compute_claim_confidence,classify_and_rank_claims],verbose=True)
#query=input("Enter query\n")
#raw_response=agent_executor.invoke({"query":query})



def run_agent(query: str):
    return agent_executor.invoke({"query": query})


