"""
run.py — Web App Entry Point
Start the FastAPI development server:
    python run.py
Then open: http://localhost:8000
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
