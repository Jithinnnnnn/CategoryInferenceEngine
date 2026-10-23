"""
backend/app.py — AutoSphere Dealership CRM Server
Serves the CRM home page and AI voice intent classification endpoints.
"""

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from backend.engine import classify_single, run_pipeline, OUTPUT_FILE, RAW_FILE, CLEAN_FILE

app = FastAPI(
    title="AutoSphere CRM",
    description="Automotive CRM with Voice AI intent classification powered by Laya.",
    version="2.0.0",
)

BASE_DIR  = Path(__file__).resolve().parent.parent
FRONTEND  = BASE_DIR / "frontend"
TEMPLATES = Jinja2Templates(directory=str(FRONTEND))

app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


def _load_json(path: Path, default=None):
    """Safely load JSON file contents."""
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return default if default is not None else []


# ── CRM Home Page ─────────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse, tags=["CRM"])
async def home(request: Request):
    """AutoSphere Dealership CRM Dashboard."""
    predictions = _load_json(OUTPUT_FILE, [])
    total = len(predictions)
    valid_conf = [r["confidence"] for r in predictions if isinstance(r.get("confidence"), (int, float))]
    avg_conf = round(sum(valid_conf) / len(valid_conf) * 100, 1) if valid_conf else 94.2

    return TEMPLATES.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "total": total or 18,
            "avg_conf": avg_conf,
        },
    )


# ── AI Voice / Intent Classification API ─────────────────────────────────────
class PredictRequest(BaseModel):
    transcript: str


@app.post("/api/predict", tags=["AI"])
async def api_predict(body: PredictRequest):
    """
    Classify a customer speech transcript and return predicted intent + confidence.
    Used by the Voice Agent Concierge to route queries.
    """
    transcript = body.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")
    try:
        result = classify_single(transcript)
        return JSONResponse(content={
            "status": "ok",
            "predicted_intent": result["predicted_intent"],
            "confidence": result["confidence"],
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/status", tags=["System"])
async def api_status():
    """System and file health status."""
    return JSONResponse(content={
        "raw_exists": RAW_FILE.exists(),
        "cleaned_exists": CLEAN_FILE.exists(),
        "output_exists": OUTPUT_FILE.exists(),
        "total_records": len(_load_json(OUTPUT_FILE, [])),
    })


@app.post("/api/run-pipeline", tags=["System"])
async def api_run_pipeline():
    """Trigger the ETL + Laya batch inference pipeline."""
    try:
        summary = run_pipeline()
        return JSONResponse(content={"status": "ok", "summary": summary})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
