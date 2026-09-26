# agent_service/agent.py
from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import InMemorySaver
import requests

NODE_API = "http://localhost:5000/internal"

# ------------------------------------------------
# 1. Tools — things the agent can go fetch itself
# ------------------------------------------------

@tool
def get_voice_profile(business_id: str) -> str:
    """Fetch this business's tone, sign-off, and sample past replies."""
    r = requests.get(f"{NODE_API}/businesses/{business_id}/voice-profile")
    profile = r.json()
    samples = "\n".join(f"- {s}" for s in profile.get("sampleReplies", []))
    return f"""
Tone words: {", ".join(profile.get("toneWords", []))}
Sign-off: {profile.get("signOff", "")}
Never mention: {", ".join(profile.get("doNotMention", []))}
Examples of replies this business has actually used:
{samples}
"""

@tool
def check_reply_length(text: str, platform: str) -> str:
    """Check a drafted reply against the platform's character limit and flag if it's too long."""
    limits = {"google": 4096, "yelp": 3000}
    limit = limits.get(platform, 4000)
    if len(text) > limit:
        return f"TOO LONG: {len(text)} chars, limit is {limit}. Shorten it."
    return f"OK: {len(text)}/{limit} chars."


# ------------------------------------------------
# 2. Create the agent
# ------------------------------------------------

agent = create_agent(
    model="claude-sonnet-4-6",     # or your model of choice
    tools=[get_voice_profile, check_reply_length],
    checkpointer=InMemorySaver(),
    system_prompt=(
        "You draft owner replies to customer reviews for small businesses in India "
        "(clinics, restaurants, shops). Always call get_voice_profile first to match "
        "the business's real voice — never write generic corporate-sounding replies. "
        "For negative reviews (1-3 stars): acknowledge specifically, never argue, "
        "offer an offline way to resolve it (phone/visit), keep it short. "
        "For positive reviews (4-5 stars): thank them specifically for what they mentioned, "
        "keep it brief, no exclamation-mark overload. "
        "Always call check_reply_length before finalizing. "
        "Return ONLY the reply text, nothing else — no preamble, no quotes."
    ),
)


def draft_reply(business_id: str, review_text: str, rating: int, platform: str = "google") -> str:
    result = agent.invoke(
        {"messages": [HumanMessage(
            content=f"business_id: {business_id}\nplatform: {platform}\nrating: {rating}/5\nreview: \"{review_text}\"\n\nDraft the reply."
        )]},
        config={"configurable": {"thread_id": f"{business_id}-{hash(review_text)}"}},
    )
    return result["messages"][-1].content