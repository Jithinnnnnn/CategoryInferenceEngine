"""
main.py — CLI Entry Point
Run this directly to execute the full ETL + Inference batch pipeline:
    python main.py
"""

from backend.engine import run_pipeline

if __name__ == "__main__":
    run_pipeline()