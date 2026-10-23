"""
run.py — Web App Launcher
Shortcut to start the CRM development server:
    python run.py
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
