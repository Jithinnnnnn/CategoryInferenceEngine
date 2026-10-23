"""
app.py — FastAPI Application Server
Serves all API endpoints and frontend HTML pages.
"""

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from backend.engine import (
    classify_single,
    run_pipeline,
    CLEAN_FILE,
    OUTPUT_FILE,
    RAW_FILE,
)

# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Category Inference Engine",
    description="AI-powered conversation intent classifier using Laya.",
    version="1.0.0",
)

BASE_DIR    = Path(__file__).resolve().parent.parent
FRONTEND    = BASE_DIR / "frontend"
TEMPLATES   = Jinja2Templates(directory=str(FRONTEND))

app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


# ── Helper ───────────────────────────────────────────────────────────────────
def _load_json(path: Path, default=None):
    """Load JSON file safely, returning default if not found."""
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return default if default is not None else []


# ── Page Routes ──────────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse, tags=["Pages"])
async def home(request: Request):
    """Home page — overview dashboard."""
    predictions = _load_json(OUTPUT_FILE, [])

    # Compute quick stats for home page cards
    total       = len(predictions)
    error_count = sum(1 for r in predictions if r.get("predicted_intent") == "Error")
    classified  = total - error_count

    intents = [r.get("predicted_intent", "Other") for r in predictions if r.get("predicted_intent") != "Error"]
    top_intent  = max(set(intents), key=intents.count) if intents else "—"
    avg_conf    = (
        round(
            sum(r["confidence"] for r in predictions if isinstance(r.get("confidence"), (int, float)))
            / max(classified, 1) * 100, 1
        )
        if classified else 0
    )

    return TEMPLATES.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "total":      total,
            "classified": classified,
            "top_intent": top_intent,
            "avg_conf":   avg_conf,
        },
    )


@app.get("/report", response_class=HTMLResponse, tags=["Pages"])
async def report(request: Request):
    """Report page — analytics dashboard with charts and data table."""
    predictions = _load_json(OUTPUT_FILE, [])
    return TEMPLATES.TemplateResponse(
        request=request,
        name="report.html",
        context={
            "predictions": predictions,
            "total":       len(predictions),
        },
    )


@app.get("/bot", response_class=HTMLResponse, tags=["Pages"])
async def bot(request: Request):
    """AI Bot page — interactive live inference chat simulator."""
    return TEMPLATES.TemplateResponse(
        request=request,
        name="bot.html",
        context={},
    )


# ── API Endpoints ─────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    transcript: str


@app.post("/api/predict", tags=["API"])
async def api_predict(body: PredictRequest):
    """
    POST /api/predict
    Classifies a single conversation transcript and returns predicted intent + confidence.
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


@app.post("/api/run-pipeline", tags=["API"])
async def api_run_pipeline():
    """
    POST /api/run-pipeline
    Triggers the full ETL + Inference batch pipeline.
    """
    try:
        summary = run_pipeline()
        return JSONResponse(content={"status": "ok", "summary": summary})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics", tags=["API"])
async def api_analytics():
    """
    GET /api/analytics
    Returns intent distribution, confidence stats, and all predictions for charts.
    """
    predictions = _load_json(OUTPUT_FILE, [])

    intent_counts: dict = {}
    conf_values = []

    for r in predictions:
        intent = r.get("predicted_intent", "Other")
        intent_counts[intent] = intent_counts.get(intent, 0) + 1
        if isinstance(r.get("confidence"), (int, float)):
            conf_values.append(round(r["confidence"] * 100, 2))

    avg_conf = round(sum(conf_values) / len(conf_values), 2) if conf_values else 0
    min_conf = round(min(conf_values), 2) if conf_values else 0
    max_conf = round(max(conf_values), 2) if conf_values else 0

    return JSONResponse(content={
        "status":        "ok",
        "total":         len(predictions),
        "intent_counts": intent_counts,
        "confidence": {
            "average": avg_conf,
            "min":     min_conf,
            "max":     max_conf,
            "values":  conf_values,
        },
        "predictions": predictions,
    })


@app.get("/api/status", tags=["API"])
async def api_status():
    """GET /api/status — Returns current data file status."""
    return JSONResponse(content={
        "raw_exists":     RAW_FILE.exists(),
        "cleaned_exists": CLEAN_FILE.exists(),
        "output_exists":  OUTPUT_FILE.exists(),
        "raw_records":    len(_load_json(RAW_FILE, [])),
        "output_records": len(_load_json(OUTPUT_FILE, [])),
    })
