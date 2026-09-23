#!/usr/bin/env python3
"""
Roamify AI - Unified Application Launcher
Runs the Flask backend server which automatically serves the frontend interface on http://127.0.0.1:5000.
"""

import os
import sys
import subprocess

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    app_script = os.path.join(backend_dir, "app.py")
    
    if not os.path.exists(app_script):
        print(f"Error: Could not locate backend script at {app_script}")
        sys.exit(1)
        
    print("Starting Roamify travel planner on http://127.0.0.1:5000 ...")
    
    # Run the backend app
    try:
        subprocess.run([sys.executable, app_script], cwd=backend_dir, check=True)
    except KeyboardInterrupt:
        print("\nRoamify AI server stopped.")

if __name__ == "__main__":
    main()
