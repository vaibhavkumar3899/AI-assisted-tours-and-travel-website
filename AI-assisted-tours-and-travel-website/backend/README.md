# Roamify - Backend Server

Flask-based API server responsible for handling trip generation requests, serving static frontend assets, and managing itinerary data (with support for optional external AI keys or the built-in generator).

---

## Directory Overview

```text
backend/
├── app.py              # Main Flask application with endpoints and generation logic
├── requirements.txt    # Python package dependencies
├── .env.example        # Environment variables template
└── README.md
```

---

## Setup & Running

1. **Install requirements**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment configuration (optional)**:
   Create a `.env` file based on `.env.example` if you want to configure an external AI API key:
   ```env
   AI_API_KEY=your_key_here
   PORT=5000
   ```

3. **Start the server**:
   ```bash
   python app.py
   ```
   The backend will run on `http://127.0.0.1:5000` and automatically serve the frontend files from `../frontend`.

---

## API Documentation

### Health Check
- **Route**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "Roamify AI Backend",
    "version": "1.0.0"
  }
  ```

### Trip Planner Endpoint
- **Route**: `POST /api/plan`
- **Request Body**:
  ```json
  {
    "destination": "Paris",
    "duration": 3,
    "style": "Leisure",
    "apiKey": ""
  }
  ```
- **Returns**: A JSON payload containing trip details (daily itinerary, coordinates for mapping, budget categories, packing list) and execution log items.
