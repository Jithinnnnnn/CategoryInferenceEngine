"""
engine.py — Category Inference Engine Core Module
Handles ETL pipeline: Extract → Transform → Load → Inference with Laya.
"""

import json
import re
from pathlib import Path

import laya

# ── Directory Paths ──────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent
RAW_FILE   = BASE_DIR / "conversations.json"
CLEAN_FILE = BASE_DIR / "cleaned_conversations.json"
OUTPUT_FILE = BASE_DIR / "predictions.json"


# ── EXTRACT ──────────────────────────────────────────────────────────────────
def extract_data(path: Path = RAW_FILE) -> list:
    """
    Reads the raw multi-turn conversations JSON file with error handling
    for missing files or malformed JSON structures.
    """
    if not path.exists():
        raise FileNotFoundError(
            f"Error: '{path.name}' was not found in {BASE_DIR}. "
            "Please ensure the file exists before running the pipeline."
        )

    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Error: '{path.name}' contains invalid JSON. Details: {e}")

    if not isinstance(data, list):
        raise ValueError("Data Quality Issue: Input JSON must be a root-level list.")

    print(f"[Extract] Loaded {len(data)} conversation record(s) from {path.name}.")
    return data


# ── TRANSFORM / CLEAN ────────────────────────────────────────────────────────
def clean_text(value) -> str:
    """Removes control characters, extra whitespace, and standardises text strings."""
    if not isinstance(value, str):
        return ""
    value = re.sub(r"[\r\n\t]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def transform_data(raw_data: list) -> list:
    """
    Cleans multi-turn conversation data. Validates nested 'messages' structure,
    removes empty/invalid speaker messages, and compiles a chronological transcript.
    """
    cleaned, seen_ids = [], set()

    for idx, record in enumerate(raw_data, start=1):
        if not isinstance(record, dict):
            print(f"[Warn] Record at index {idx - 1} is not a dict. Skipping.")
            continue

        raw_id = record.get("conversation_id")
        conversation_id = clean_text(str(raw_id)) if raw_id else f"CONV{idx:03d}"

        if conversation_id in seen_ids:
            print(f"[Warn] Duplicate conversation ID '{conversation_id}'. Skipping.")
            continue

        messages = record.get("messages", [])
        if not isinstance(messages, list):
            print(f"[Warn] 'messages' in '{conversation_id}' must be a list. Skipping.")
            continue

        clean_messages, transcript_parts = [], []

        for msg_idx, message in enumerate(messages):
            if not isinstance(message, dict):
                continue

            speaker = clean_text(message.get("speaker", "")).lower()
            text    = clean_text(message.get("text", ""))

            if speaker not in {"customer", "ai", "agent"} or not text:
                continue

            clean_messages.append({"speaker": speaker, "text": text})
            transcript_parts.append(f"{speaker.capitalize()}: {text}")

        if not any(m["speaker"] == "customer" for m in clean_messages):
            print(f"[Skip] '{conversation_id}': No valid customer messages found.")
            continue

        cleaned.append({
            "conversation_id": conversation_id,
            "messages": clean_messages,
            "transcript": "\n".join(transcript_parts)
        })
        seen_ids.add(conversation_id)

    print(f"[Transform] Cleaned {len(cleaned)} conversation(s).")
    return cleaned


# ── SAVE JSON ────────────────────────────────────────────────────────────────
def save_json(path: Path, data) -> None:
    """Saves dict/list to a JSON file with pretty indentation."""
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[Save] Data written to {path.name}.")


# ── INFERENCE WITH LAYA ──────────────────────────────────────────────────────
_AGENT = None  # Cached model instance


def _get_agent():
    """Lazy-loads and caches the Laya model (loaded once per process)."""
    global _AGENT
    if _AGENT is None:
        print("[Laya] Loading model 'convaiinnovations/laya' ...")
        try:
            _AGENT = laya.load("convaiinnovations/laya")
            print("[Laya] Model loaded successfully.")
        except Exception as e:
            raise RuntimeError(
                f"Failed to load Laya model. Verify installation and model name. Details: {e}"
            )
    return _AGENT


INTENT_QUESTIONS = {
    "intent": {
        "type": "choice",
        "instructions": (
            "Classify the primary intent of the customer based on the entire "
            "conversation transcript. Do not classify from a single sentence alone. "
            "If the customer expresses dissatisfaction, reports damage, or describes "
            "an unresolved issue, prefer complaint. Otherwise identify the main sales "
            "or service intent. Use Other for greetings, thanks, or unrelated conversations."
        ),
        "criteria": {
            "sales": (
                "The main goal is buying a vehicle, asking about price, variants, "
                "offers, finance, exchange, booking, or a test drive."
            ),
            "service": (
                "The main goal is vehicle maintenance, routine servicing, repair, "
                "or a technical question without a primary complaint."
            ),
            "complaint": (
                "The customer is dissatisfied, reports poor service, damage, "
                "a delay, or an unresolved problem."
            ),
            "Other": (
                "Greetings, thanks, unrelated requests, or conversations with "
                "no clear sales, service, or complaint intent."
            )
        }
    }
}


def classify_single(transcript: str) -> dict:
    """
    Classifies a single transcript string via Laya.
    Returns: { "predicted_intent": str, "confidence": float|None }
    """
    agent = _get_agent()
    prediction = agent.predict({"message": transcript}, INTENT_QUESTIONS)
    answer = prediction["answers"]["intent"]
    return {
        "predicted_intent": answer.get("choice", "Other"),
        "confidence": answer.get("answer_confidence")
    }


def classify_batch(cleaned_data: list) -> list:
    """
    Classifies a list of cleaned conversation records.
    Returns a list of result dicts with conversation_id, transcript, predicted_intent, confidence.
    """
    if not cleaned_data:
        print("[Classify] No cleaned conversations to classify.")
        return []

    results = []
    for record in cleaned_data:
        conv_id    = record["conversation_id"]
        transcript = record["transcript"]
        try:
            prediction = classify_single(transcript)
            result = {"conversation_id": conv_id, "transcript": transcript, **prediction}

            confidence_text = (
                f"{prediction['confidence'] * 100:.2f}%"
                if isinstance(prediction["confidence"], (int, float)) else "N/A"
            )
            print(f"[Classify] {conv_id} → {prediction['predicted_intent']} ({confidence_text})")
        except Exception as err:
            print(f"[Error] Failed to classify '{conv_id}': {err}")
            result = {
                "conversation_id": conv_id,
                "transcript": transcript,
                "predicted_intent": "Error",
                "confidence": None
            }
        results.append(result)

    return results


# ── FULL PIPELINE ────────────────────────────────────────────────────────────
def run_pipeline(
    raw_path: Path = RAW_FILE,
    clean_path: Path = CLEAN_FILE,
    output_path: Path = OUTPUT_FILE
) -> dict:
    """
    Runs the complete ETL + Inference pipeline.
    Returns a summary dict with stats.
    """
    print("── Starting Category Inference Pipeline ──")

    raw_data    = extract_data(raw_path)
    cleaned     = transform_data(raw_data)
    save_json(clean_path, cleaned)

    results     = classify_batch(cleaned)
    save_json(output_path, results)

    summary = {
        "total_loaded":    len(raw_data),
        "total_cleaned":   len(cleaned),
        "total_classified": len(results),
        "output_file":     str(output_path.name),
        "clean_file":      str(clean_path.name),
    }

    print("\n── Pipeline Complete ──")
    for k, v in summary.items():
        print(f"  {k}: {v}")

    return summary
