"""
AI Integration Service: Daily India Crime & Accidents Ingest Pipeline
Uses official `google-genai` SDK with Web Search Grounding to fetch live,
severity-prioritized incidents across all Indian regions, validates dates,
deduplicates them, and pushes clean JSON records to your Backend API.
"""

import os
import json
import re
import sys
import time
import difflib
from datetime import datetime, timezone, timedelta
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Configuration
GEMINI_API_KEY = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("GEMINI_KEY")
)
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:3000/records")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY must be set in the environment.")

# Initialize official Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

# Regional groupings split into state-focused sub-groups to eliminate Delhi/NCR bias
REGIONAL_GROUPS = {
    "South_Telangana_AP": ["Telangana", "Andhra Pradesh"],
    "South_TamilNadu_Kerala": ["Tamil Nadu", "Kerala"],
    "South_Karnataka": ["Karnataka"],
    "North": [
        "Delhi",
        "Punjab",
        "Haryana",
        "Uttar Pradesh",
        "Uttarakhand",
        "Himachal Pradesh",
        "Jammu and Kashmir",
    ],
    "West_Central": [
        "Maharashtra",
        "Gujarat",
        "Rajasthan",
        "Madhya Pradesh",
        "Chhattisgarh",
        "Goa",
    ],
    "East_Northeast": [
        "West Bengal",
        "Bihar",
        "Jharkhand",
        "Odisha",
        "Assam",
        "Tripura",
        "Meghalaya",
        "Manipur",
        "Nagaland",
    ],
}

# Targeted regional ground outlets and local language terminology instructions
REGIONAL_MEDIA_INSTRUCTIONS = {
    "South_Telangana_AP": """
SOURCE DIRECTIVE:
Primary focus on regional/district news sources: Eenadu, Sakshi, Namasthe Telangana, V6 News, NTV Telugu, T News, TV9 Telugu, Deccan Chronicle, The News Minute.
Search local terms: ప్రమాదం (Accident), హత్య (Murder), అగ్నిప్రమాదం (Fire).
    """,
    "South_TamilNadu_Kerala": """
SOURCE DIRECTIVE:
Primary focus on regional/district news sources: Puthiya Thalaimurai, Thanthi TV, News18 Tamil Nadu, Sun News, Asianet News, Malayala Manorama, Mathrubhumi, Reporter TV, The News Minute.
Search local terms: விபத்து (Accident), கொலை (Murder), അപകടം (Accident), കൊലപാതകം (Murder).
    """,
    "South_Karnataka": """
SOURCE DIRECTIVE:
Primary focus on regional/district news sources: TV9 Kannada, Public TV, Suvarna News, News18 Kannada, Deccan Herald.
Search local terms: ಅಪಘಾತ (Accident), ಕೊಲೆ (Murder).
    """,
    "North": "SOURCE DIRECTIVE: Focus on local district reporting and regional state portals across North Indian states.",
    "West_Central": "SOURCE DIRECTIVE: Focus on local district reporting across Maharashtra, Gujarat, MP, and Rajasthan local news.",
    "East_Northeast": "SOURCE DIRECTIVE: Focus on local district reporting across Eastern and Northeastern state dailies.",
}


def validate_date_range(records: list, target_date: str) -> list:
    """
    Hard Python Filter: Validates that returned incident dates are strictly within
    the last 48-hour window (target_date or yesterday). Filters out recycled past news.
    """
    if not records:
        return []

    target_dt = datetime.strptime(target_date, "%Y-%m-%d")
    yesterday_dt = target_dt - timedelta(days=1)
    
    valid_dates = {target_dt.strftime("%Y-%m-%d"), yesterday_dt.strftime("%Y-%m-%d")}
    
    clean_records = []
    dropped_count = 0

    for item in records:
        event_date = str(item.get("date", "")).strip()
        if event_date in valid_dates:
            clean_records.append(item)
        else:
            dropped_count += 1
            print(f"[!] Outdated date dropped ({event_date}): {item.get('description')[:60]}...")

    if dropped_count > 0:
        print(f"[✓] Date Filter: Excluded {dropped_count} outdated/recycled report(s).")
        
    return clean_records


def fetch_region_incidents(
    region_name: str, states_list: list, target_date: str, max_retries: int = 3
) -> list:
    """Fetches incident news for a specific region with retry logic and ground media targeting."""
    states_str = ", ".join(states_list)
    media_instruction = REGIONAL_MEDIA_INSTRUCTIONS.get(region_name, "")
    print(f"[*] Fetching ground incidents for region [{region_name}]...")

    target_dt = datetime.strptime(target_date, "%Y-%m-%d")
    yesterday_str = (target_dt - timedelta(days=1)).strftime("%Y-%m-%d")

    prompt_text = f"""
Search Google News for major road/train accidents, fires, industrial hazards, and criminal incidents reported in these Indian states/UTs occurring between {yesterday_str} and {target_date}:
{states_str}

{media_instruction}

SELECTION & PRIORITIZATION CRITERIA:
1. Prioritize major events (fatalities > 0, major injuries, large fires, or major crimes).
2. Do NOT apply artificial state limits. Include all notable ground-level incidents in these states.
3. Search hyper-local district, mandal, and town level reports. Avoid over-indexing on Delhi/NCR national television feeds.
4. STRICT DATE GUARDRAIL: ONLY extract incidents that actually occurred on {yesterday_str} or {target_date}. IGNORE historical accidents (e.g., from 2025 or earlier) even if a news website re-posted or re-indexed the article today.
5. Translate any vernacular news summary into English.
6. Output ONLY a valid raw JSON array with no conversational text or markdown.

JSON Schema per item:
[
  {{
    "date": "YYYY-MM-DD",
    "state": "State Name",
    "district": "District Name",
    "city": "City/Town Name",
    "type": "one of: road_accident, train_accident, fire, murder, theft, robbery, assault, cybercrime, accident",
    "deaths": 0,
    "injuries": 0,
    "source": "News Agency or Police Source",
    "description": "Short 1-2 sentence event summary"
  }}
]
"""

    for attempt in range(1, max_retries + 1):
        try:
            chat = client.chats.create(
                model="gemini-2.5-flash",
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    safety_settings=[
                        types.SafetySetting(
                            category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
                            threshold=types.HarmBlockThreshold.BLOCK_NONE,
                        ),
                        types.SafetySetting(
                            category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                            threshold=types.HarmBlockThreshold.BLOCK_NONE,
                        ),
                        types.SafetySetting(
                            category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                            threshold=types.HarmBlockThreshold.BLOCK_NONE,
                        ),
                    ],
                ),
            )

            response = chat.send_message(prompt_text)

            raw_text = ""
            if hasattr(response, "text") and response.text:
                raw_text = response.text.strip()
            elif response.candidates and response.candidates[0].content.parts:
                parts = response.candidates[0].content.parts
                raw_text = "".join(
                    [p.text for p in parts if hasattr(p, "text") and p.text]
                ).strip()

            if not raw_text:
                print(
                    f"[!] Region {region_name} returned an empty response.",
                    file=sys.stderr,
                )
                return []

            # Clean JSON response
            json_match = re.search(r"\[.*\]", raw_text, re.DOTALL)
            clean_json = json_match.group(0) if json_match else raw_text.strip()

            data = json.loads(clean_json)

            # Handle possible object wrappers e.g., {"records": [...]}
            if isinstance(data, dict):
                for key in ["records", "incidents", "data"]:
                    if key in data and isinstance(data[key], list):
                        data = data[key]
                        break
                else:
                    data = [data]

            if isinstance(data, list):
                # Apply date validation to immediately reject older events
                return validate_date_range(data, target_date)
            return []

        except Exception as e:
            print(f"[!] Attempt {attempt}/{max_retries} failed for {region_name}: {e}", file=sys.stderr)
            if attempt < max_retries:
                time.sleep(2 * attempt)
            else:
                print(f"[!] All retries exhausted for region {region_name}.", file=sys.stderr)
                return []


def deduplicate_records(records: list, similarity_threshold: float = 0.68) -> list:
    """Removes duplicate news reports of the same incident based on location and text similarity."""
    if not records:
        return []

    unique_records = []

    for new_item in records:
        is_duplicate = False

        new_date = str(new_item.get("date", "")).strip()
        new_state = str(new_item.get("state", "")).strip().lower()
        new_city = str(new_item.get("city", "")).strip().lower()
        new_type = str(new_item.get("type", "")).strip().lower()
        new_desc = str(new_item.get("description", "")).strip().lower()

        for existing_item in unique_records:
            ex_date = str(existing_item.get("date", "")).strip()
            ex_state = str(existing_item.get("state", "")).strip().lower()
            ex_city = str(existing_item.get("city", "")).strip().lower()
            ex_type = str(existing_item.get("type", "")).strip().lower()
            ex_desc = str(existing_item.get("description", "")).strip().lower()

            if (new_date == ex_date) and (new_state == ex_state) and (new_type == ex_type):
                same_city = (new_city != "") and (new_city == ex_city)
                text_similarity = difflib.SequenceMatcher(None, new_desc, ex_desc).ratio()

                if same_city or text_similarity >= similarity_threshold:
                    print(f"[!] Duplicate skipped ({text_similarity*100:.1f}% match):")
                    print(f"    Existing: {existing_item.get('description')[:70]}...")
                    print(f"    New:      {new_item.get('description')[:70]}...\n")
                    is_duplicate = True
                    break

        if not is_duplicate:
            unique_records.append(new_item)

    print(f"[✓] Deduplication: Reduced {len(records)} raw records to {len(unique_records)} unique incidents.")
    return unique_records


def fetch_all_india_data(target_date: str) -> list:
    """Combines incident reports from all regional groups."""
    all_incidents = []

    for region_name, states in REGIONAL_GROUPS.items():
        records = fetch_region_incidents(region_name, states, target_date)
        print(f"[✓] Captured {len(records)} valid incident(s) from {region_name}.")
        all_incidents.extend(records)
        time.sleep(1)

    return all_incidents


def push_records_to_backend(records: list) -> bool:
    """Sends clean records to the backend POST endpoint."""
    if not records:
        print("[!] No records to push.")
        return False

    print(f"[*] Sending {len(records)} unique records to Backend API at: {BACKEND_API_URL}")
    try:
        resp = requests.post(BACKEND_API_URL, json=records, timeout=20)
        if resp.status_code in (200, 201):
            print(f"[✓] Success: Backend accepted records ({resp.status_code}).")
            return True
        else:
            print(f"[!] Backend returned error status {resp.status_code}: {resp.text}")
            return False
    except requests.exceptions.RequestException as err:
        print(f"[!] Failed to connect to Backend API: {err}")
        return False


def main():
    print("================================================================")
    print(" India Crime & Accidents Ingest Pipeline (Ground & Regional) ")
    print("================================================================")

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # 1. Fetch raw data across all regional groups (with hard date filtering)
    raw_records = fetch_all_india_data(today_str)

    if raw_records:
        # 2. Filter out duplicates
        clean_records = deduplicate_records(raw_records, similarity_threshold=0.68)

        # 3. Push to backend database
        push_records_to_backend(clean_records)
    else:
        print("[!] No valid records fetched today.")


if __name__ == "__main__":
    main()
