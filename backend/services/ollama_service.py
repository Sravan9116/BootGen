import requests
import json
import re
import logging
from typing import Dict, Any

# Set up logger
logger = logging.getLogger("sentinel.ollama")
logging.basicConfig(level=logging.INFO)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen3:8b"

def get_fallback_analysis(message: str) -> Dict[str, Any]:
    """
    Fallback mock AI analyzer that uses regex and rules when local Ollama is offline.
    """
    text = message.lower()
    
    # Defaults
    classification = "UNDER_REVIEW"
    confidence = 80
    topic = "General Inquiry"
    department = "Other Departments"
    urgency = "LOW"
    location = "Unknown Location"
    summary = "No specific issue detected."
    reason = "The system is using fallback heuristics analysis."

    # Location extraction (predefined list or regex matching e.g., "in Nagercoil", "at Amrita")
    locations = ["anna nagar", "t nagar", "adyar", "velachery", "city center", "highway 45", "main road", "zone 3", "amrita", "nagercoil"]
    for loc in locations:
        if loc in text:
            location = loc.title()
            break
            
    if location == "Unknown Location":
        match_in = re.search(r'\b(?:in|at)\s+([a-zA-Z0-9\s]{3,20})\b', message)
        if match_in:
            location = match_in.group(1).strip().title()

    # Topic & Department Routing Heuristics
    if any(k in text for k in ["flood", "flooding", "waterlog", "submerged", "drown", "water level"]):
        topic = "Flood"
        department = "Water Department"
        urgency = "HIGH" if any(k in text for k in ["trap", "severe", "danger", "critical", "help"]) else "MEDIUM"
        summary = "Potential flooding incident reported."
        reason = "Detected flooding-related keywords in content."
        classification = "UNDER_REVIEW"
    elif any(k in text for k in ["rain", "storm", "monsoon", "weather", "cyclone", "wind"]):
        topic = "Heavy Rainfall"
        department = "Weather Department"
        urgency = "MEDIUM"
        summary = "Weather activity reported by user."
        reason = "Keywords related to weather/precipitation detected."
    elif any(k in text for k in ["accident", "traffic", "road block", "crash", "collision", "bridge", "highway"]):
        topic = "Traffic / Infrastructure"
        department = "Traffic Department"
        urgency = "HIGH" if "collapse" in text or "accident" in text else "MEDIUM"
        summary = "Traffic disruption or road accident reported."
        reason = "Keywords related to vehicular traffic/accidents identified."
    elif any(k in text for k in ["outbreak", "fever", "virus", "infection", "epidemic", "dengue", "disease", "covid"]):
        topic = "Public Health"
        department = "Health Department"
        urgency = "HIGH"
        summary = "Potential public health issue or disease outbreak."
        reason = "Health risk indicator words identified."
    elif any(k in text for k in ["fire", "smoke", "burn", "explosion"]):
        topic = "Fire Incident"
        department = "Disaster Management"
        urgency = "CRITICAL"
        summary = "Fire emergency reported."
        reason = "Thermal emergency keywords detected."
    elif any(k in text for k in ["power", "outage", "electricity", "blackout", "transformer", "load shedding"]):
        topic = "Power Outage"
        department = "Electricity Department"
        urgency = "MEDIUM"
        summary = "Electricity supply disruption reported."
        reason = "Power grid failure indicators identified."
    elif any(k in text for k in ["water supply", "water pipe", "no water", "drinking water"]):
        topic = "Water Supply"
        department = "Water Department"
        urgency = "LOW"
        summary = "Water utility issue reported."
        reason = "Utility/water service failure keywords detected."

    # Critical triggers
    if any(k in text for k in ["trapped", "injured", "collapsed", "explosion", "dying", "urgent"]):
        urgency = "CRITICAL"
        classification = "UNDER_REVIEW" # Critical alert status starts under review

    return {
        "summary": summary,
        "topic": topic,
        "classification": classification,
        "confidence": confidence,
        "urgency": urgency,
        "recommended_department": department,
        "location": location,
        "reason": reason
    }

def analyze_message(message: str) -> Dict[str, Any]:
    """
    Send the user's message to local Ollama (qwen3:8b) for structured JSON classification.
    Falls back to regex heuristics if Ollama is unreachable or times out.
    """
    prompt = f"""You are SENTINEL AI, an expert incident analysis agent.
Analyze the following user social media message:
"{message}"

Classify it based on topic, urgency (LOW, MEDIUM, HIGH, CRITICAL), recommended government department, location if mentioned, and write a summary.
The classification field must be one of: "UNDER_REVIEW", "LIKELY_TRUE", "PARTIALLY_CORRECT", "LIKELY_FALSE", "FALSE".
The recommended_department must be one of: "Traffic Department", "Water Department", "Weather Department", "Health Department", "Disaster Management", "Electricity Department", "Police / Public Safety", "Other Departments".

Routing rules for recommended_department:
- Always route flood, waterlogging, pipeline leaks, and rain accumulation reports to "Water Department".
- Always route fire accidents, explosions, collapses, and rescue events to "Disaster Management".

You MUST respond ONLY with a valid JSON object matching the schema below, without markdown formatting blocks:
{{
  "summary": "Short summary of the post",
  "topic": "Detected topic (e.g. Flood, Traffic, Outage)",
  "classification": "UNDER_REVIEW",
  "confidence": 85,
  "urgency": "HIGH",
  "recommended_department": "Disaster Management",
  "location": "Detected location (or 'Unknown Location' if not mentioned)",
  "reason": "The reason for this classification"
}}
"""
    
    try:
        logger.info(f"Attempting to call local Ollama model {MODEL_NAME}...")
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "format": "json",
                "stream": False
            },
            timeout=5.0 # Set a short timeout so that the app stays fast
        )
        
        if response.status_code == 200:
            result = response.json()
            raw_response = result.get("response", "").strip()
            
            # Clean possible markdown wrap
            if raw_response.startswith("```"):
                # strip code block formatting
                raw_response = re.sub(r"^```(?:json)?\n", "", raw_response)
                raw_response = re.sub(r"\n```$", "", raw_response)
                raw_response = raw_response.strip()

            parsed_data = json.loads(raw_response)
            logger.info("Ollama AI Analysis successful.")
            
            # Ensure required keys exist
            required_keys = ["summary", "topic", "classification", "confidence", "urgency", "recommended_department", "location", "reason"]
            for key in required_keys:
                if key not in parsed_data:
                    parsed_data[key] = get_fallback_analysis(message).get(key)
            return parsed_data
            
        else:
            logger.warning(f"Ollama returned status code {response.status_code}. Using fallback.")
            return get_fallback_analysis(message)
            
    except Exception as e:
        logger.warning(f"Ollama integration offline or failed: {str(e)}. Using fallback analyzer.")
        fallback = get_fallback_analysis(message)
        # Indicate that the service is offline in the reason
        fallback["reason"] = f"AI SERVICE OFFLINE. (Fallback rules triggered: {fallback['reason']})"
        return fallback
