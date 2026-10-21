import json
import re
from pathlib import Path
import laya

# Define base directory for file paths
BASE_DIR = Path(__file__).resolve().parent

RAW_FILE = BASE_DIR / "conversations.json"
CLEAN_FILE = BASE_DIR / "cleaned_conversations.json"
OUTPUT_FILE = BASE_DIR / "predictions.json"


# -------------------------
# EXTRACT
# -------------------------
def extract_data():
    """
    Reads the raw conversations JSON file with error handling 
    for missing files or malformed JSON structures.
    """
    if not RAW_FILE.exists():
        raise FileNotFoundError(
            f"Error: The file '{RAW_FILE.name}' was not found in {BASE_DIR}. "
            "Please ensure the file exists before running the script."
        )

    try:
        with RAW_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Error: '{RAW_FILE.name}' contains invalid JSON formatting. Details: {e}"
        )

    if not isinstance(data, list):
        raise ValueError("Data Quality Issue: Input JSON must contain a root-level list of conversations.")

    print(f"Extraction Successful: Loaded {len(data)} raw conversations from {RAW_FILE.name}.")
    return data


# -------------------------
# TRANSFORM / CLEAN
# -------------------------
def clean_text(value):
    """Removes control characters, extra whitespace, and standardizes text strings."""
    if not isinstance(value, str):
        return ""
    value = re.sub(r"[\r\n\t]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def transform_data(raw_data):
    """
    Cleans raw conversation data. Handles both flat key-value speaker format
    (e.g., {"customer": "...", "ai": "..."}) and nested format with 'messages'.
    Auto-generates missing conversation IDs.
    """
    cleaned = []
    seen_ids = set()

    for idx, record in enumerate(raw_data, start=1):
        if not isinstance(record, dict):
            print(f"Data Warning: Record at index {idx - 1} is not a dictionary. Skipping.")
            continue

        # Extract or auto-generate conversation ID
        raw_id = record.get("conversation_id")
        if raw_id:
            conversation_id = clean_text(str(raw_id))
        else:
            conversation_id = f"CONV{idx:03d}"

        if conversation_id in seen_ids:
            print(f"Data Quality Issue: Duplicate conversation ID '{conversation_id}' detected. Skipping.")
            continue

        clean_messages = []
        transcript_parts = []

        # Case A: Nested 'messages' format
        if "messages" in record and isinstance(record["messages"], list):
            for message in record["messages"]:
                if not isinstance(message, dict):
                    continue
                speaker = clean_text(message.get("speaker", "")).lower()
                text = clean_text(message.get("text", ""))

                if speaker in {"customer", "ai", "agent"} and text:
                    clean_messages.append({"speaker": speaker, "text": text})
                    transcript_parts.append(f"{speaker.capitalize()}: {text}")

        # Case B: Flat format (e.g., {"customer": "...", "ai": "..."})
        else:
            for key, val in record.items():
                speaker = clean_text(key).lower()
                text = clean_text(val)
                if speaker in {"customer", "ai", "agent"} and text:
                    clean_messages.append({"speaker": speaker, "text": text})
                    transcript_parts.append(f"{speaker.capitalize()}: {text}")

        # Ensure there is at least one customer message to classify
        if not any(m["speaker"] == "customer" for m in clean_messages):
            print(f"Skipping '{conversation_id}': No valid customer messages found.")
            continue

        transcript = "\n".join(transcript_parts)

        cleaned.append({
            "conversation_id": conversation_id,
            "messages": clean_messages,
            "transcript": transcript
        })

        seen_ids.add(conversation_id)

    print(f"Transformation Complete: Successfully cleaned {len(cleaned)} conversations.")
    return cleaned


# -------------------------
# LOAD CLEANED DATA
# -------------------------
def save_json(path, data):
    """Saves dictionary or list data to a JSON file with proper indentation."""
    with path.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
    print(f"Successfully saved data to {path.name}.")


# -------------------------
# INFERENCE WITH LAYA
# -------------------------
def classify_conversations(cleaned_data):
    """
    Passes cleaned conversation transcripts through the open-source Laya model 
    to perform intent detection (sales, service, complaint, or Other).
    """
    if not cleaned_data:
        print("No cleaned conversations available for inference.")
        return []

    print("Loading Laya model ('convaiinnovations/laya')...")
    try:
        agent = laya.load("convaiinnovations/laya")
    except Exception as e:
        raise RuntimeError(
            f"Failed to load Laya model. Please verify library installation and model name. Details: {e}"
        )

    questions = {
        "intent": {
            "type": "choice",
            "instructions": (
                "Classify the primary intent of the customer "
                "based on the entire conversation transcript. "
                "Do not classify from a single sentence alone. "
                "If the customer expresses dissatisfaction, "
                "reports damage, or describes an unresolved issue, "
                "prefer complaint. Otherwise identify the main "
                "sales or service intent. Use Other for greetings, "
                "thanks, or unrelated conversations."
            ),
            "criteria": {
                "sales": (
                    "The main goal is buying a vehicle, asking "
                    "about price, variants, offers, finance, "
                    "exchange, booking, or a test drive."
                ),
                "service": (
                    "The main goal is vehicle maintenance, "
                    "routine servicing, repair, or a technical "
                    "question without a primary complaint."
                ),
                "complaint": (
                    "The customer is dissatisfied, reports "
                    "poor service, damage, a delay, or an "
                    "unresolved problem."
                ),
                "Other": (
                    "Greetings, thanks, unrelated requests, "
                    "or conversations with no clear sales, "
                    "service, or complaint intent."
                )
            }
        }
    }

    results = []

    for record in cleaned_data:
        transcript = record["transcript"]
        conv_id = record["conversation_id"]

        try:
            state = {"message": transcript}
            prediction = agent.predict(state, questions)
            answer = prediction["answers"]["intent"]

            predicted_choice = answer.get("choice", "Other")
            confidence = answer.get("answer_confidence")

            results.append({
                "conversation_id": conv_id,
                "transcript": transcript,
                "predicted_intent": predicted_choice,
                "confidence": confidence
            })

            confidence_text = (
                f"{confidence * 100:.2f}%"
                if isinstance(confidence, (int, float))
                else "N/A"
            )

            print(f"\n[Verified] Conversation ID: {conv_id}")
            print(f"  -> Predicted Intent: {predicted_choice}")
            print(f"  -> Confidence: {confidence_text}")

        except Exception as error:
            print(f"Inference Warning: Failed to classify conversation '{conv_id}': {error}")
            results.append({
                "conversation_id": conv_id,
                "transcript": transcript,
                "predicted_intent": "Error",
                "confidence": None
            })

    return results


# -------------------------
# RUN THE ETL PIPELINE
# -------------------------
def main():
    print("--- Starting ETL & Inference Pipeline ---")
    
    # 1. Extract
    raw_data = extract_data()

    # 2. Transform & Clean
    cleaned_data = transform_data(raw_data)
    save_json(CLEAN_FILE, cleaned_data)

    # 3. Load & Inference
    results = classify_conversations(cleaned_data)
    save_json(OUTPUT_FILE, results)

    print("\nPipeline Execution Successful.")
    print(f"-> Cleaned Data Output: {CLEAN_FILE.name}")
    print(f"-> Predictions Output: {OUTPUT_FILE.name}")
    print(f"-> Total Classified Conversations: {len(results)}")


if __name__ == "__main__":
    main()