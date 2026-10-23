"""
main.py — AutoSphere CRM Entry Point
Run the CRM web app directly:
    python main.py
Or open:
    http://localhost:8000
"""

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 AutoSphere Dealership CRM & Voice AI Concierge")
    print("🌐 Web App: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )