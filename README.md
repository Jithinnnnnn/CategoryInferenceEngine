# 🚗 AutoSphere CRM — Automotive Dealership & Voice AI Concierge

> An autonomous automotive dealership CRM powered by **Laya AI** conversation intent classification and browser-native **Web Speech Recognition & Synthesis**.

---

## 🌟 Highlights

- **🚘 Showroom Inventory & Cars On Sale**: Real-time fleet catalog featuring 8 vehicles with detailed specifications (engine, transmission, fuel, efficiency, pricing) and instant filtering (*All Vehicles*, *🔥 On Sale Now*, *⚡ Electric & Hybrid*, *🚙 SUVs*, *🏎️ Sedans*).
- **🎙️ Autonomous AI Voice Concierge**:
  - Voice-to-voice interaction using browser **SpeechRecognition** and **SpeechSynthesis**.
  - Dynamic audio waveform visualizer and animated pulsing radar HUD.
  - Real-time NLP intent categorization (*Sales*, *Service*, *Complaint*) powered by **Laya**.
  - Instant spoken dealership responses for pricing, cars on sale, test-drive booking, and service appointments.
- **📋 CRM Customer Lead Management**: Track incoming customer inquiries, communication channels, vehicle of interest, and AI-inferred intent tags with one-click test-drive booking.
- **⚡ Built-in ETL Pipeline**: Automated extraction, data transformation, cleaning, and model inference on customer transcripts.

---

## 📁 Project Structure

The project has been cleaned and simplified to a minimal, high-efficiency structure:

```text
CategoryInferenceEngine/
│
├── backend/
│   ├── __init__.py
│   ├── app.py                     # FastAPI application & API endpoints
│   └── engine.py                  # Laya AI inference engine & ETL pipeline
│
├── frontend/
│   ├── css/
│   │   └── style.css              # Dark-mode design system & animations
│   ├── js/
│   │   └── app.js                 # Unified script: UI, inventory, leads & voice AI
│   └── index.html                 # Single-page Dealership CRM Dashboard
│
├── conversations.json             # Raw input conversation dataset
├── cleaned_conversations.json     # Cleaned and validated dataset
├── predictions.json               # Model inference output records
├── requirements.txt               # Python package dependencies
├── main.py                        # Single command runner for the application
└── README.md                      # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.9+** installed on your system.

### 2. Set Up Virtual Environment

Open PowerShell or Command Prompt in the project folder:

```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Windows (Command Prompt):
.venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt
```

### 3. Run the Application

Launch the server with a single command:

```powershell
python main.py
```

* **CRM Web App**: 👉 [http://localhost:8000](http://localhost:8000)
* **Interactive API Documentation (Swagger)**: 👉 [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🎙️ How to Use the AI Voice Agent

1. Open **[http://localhost:8000](http://localhost:8000)** in Chrome, Edge, or any modern browser.
2. In the **Dealership AI Voice Concierge** section:
   - Click the **🎙️ microphone button** to start speaking.
   - Say questions such as:
     - *"Which cars are currently on sale?"*
     - *"Can I book a test drive for the Kia Seltos tomorrow?"*
     - *"What is the price and range of the Tesla Model Y?"*
     - *"I need to book a routine service appointment for my car."*
3. The AI agent will:
   - Capture and transcribe your speech.
   - Classify the intent (`Sales`, `Service`, or `Complaint`) with confidence scoring.
   - Answer contextually and speak the reply back aloud through your speakers.
4. *Tip:* You can also click any of the **quick voice chips** or type into the fallback input field to test without a microphone.

---

## 🔌 API Reference

### 1. Predict Intent
- **Endpoint**: `POST /api/predict`
- **Request Body**:
  ```json
  {
    "transcript": "Hi, I am interested in buying a Kia Seltos. What are the deals?"
  }
  ```
- **Response**:
  ```json
  {
    "status": "ok",
    "predicted_intent": "Sales",
    "confidence": 0.8049
  }
  ```

### 2. System Status
- **Endpoint**: `GET /api/status`
- **Response**: Returns health of dataset files (`conversations.json`, `predictions.json`).

### 3. Run Batch Pipeline
- **Endpoint**: `POST /api/run-pipeline`
- **Response**: Executes ETL cleaning and batch classification over `conversations.json`.

---

## 🛠️ Technology Stack

- **Backend**: FastAPI, Uvicorn, Jinja2, Pydantic, Laya AI model.
- **Frontend**: Vanilla HTML5, CSS3 (Modern Glassmorphism & Neon Glow UI), JavaScript (ES6+).
- **Voice Intelligence**: Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`).