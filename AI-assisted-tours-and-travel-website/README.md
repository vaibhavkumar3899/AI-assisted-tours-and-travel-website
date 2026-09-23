# Roamify - Smart Travel Itinerary Planner

Roamify is a full-stack web application designed to help travelers plan trips quickly. Given a destination, duration, and travel style, the app creates a day-by-day itinerary with mapped attractions, an estimated budget breakdown, a destination-specific packing checklist, and an interactive travel route map.

The project is organized as a monorepo with distinct `frontend/` and `backend/` directories.

---

## Project Structure

```text
├── backend/
│   ├── app.py              # Flask REST API server and itinerary generation logic
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variable sample
│   └── README.md           # Backend documentation
├── frontend/
│   ├── assets/             # Project images and icons
│   ├── css/
│   │   └── style.css       # Custom stylesheet (dark theme & layout)
│   ├── js/
│   │   ├── app.js          # Client-side UI interactions and API handling
│   │   └── map.js          # Leaflet.js map initialization and markers
│   ├── index.html          # Main single-page interface
│   ├── package.json        # Frontend scripts
│   └── README.md           # Frontend documentation
├── run.py                  # Root helper to start the backend with one command
├── package.json            # Root configuration
├── requirements.txt        # Root dependencies pointer
└── README.md
```

---

## Features

- **Custom Itinerary Planning**: Generates day-by-day schedules categorized into sightseeing, dining, accommodation, and shopping.
- **Interactive Map**: Displays daily route stops using Leaflet.js with custom category markers and connected polylines.
- **Budget Breakdown**: Calculates estimated costs across major travel categories (transportation, lodging, food, activities) and renders them in a Chart.js doughnut chart.
- **Packing Checklist**: Provides an interactive packing list based on the chosen destination and trip length.
- **Travel Assistant Chat**: Allows users to request itinerary tweaks directly through an in-page chat box.
- **Dual Planning Mode**:
  - Works with an external AI API if an API key is provided.
  - Automatically falls back to an internal travel engine with pre-built destination data (Tokyo, Paris, Bali, Rome, New York) and dynamic itinerary generation for other cities, requiring zero API keys to run.

---

## Tech Stack

- **Backend**: Python 3.9+, Flask, Flask-CORS, python-dotenv
- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6)
- **Libraries**: Leaflet.js (OpenStreetMap / CartoDB tiles), Chart.js (Budget charts), Font Awesome (Icons)

---

## Quickstart

### Prerequisites
- Python 3.9 or newer installed on your machine (`python --version`)
- pip package manager

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/AI-assisted-tours-and-travel-website.git
cd AI-assisted-tours-and-travel-website
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. (Optional) Configure API Key
If you want to use an external AI API, create a `.env` file inside the `backend/` folder:
```env
AI_API_KEY=your_api_key_here
PORT=5000
```
*Note: If no API key is set, the app will run using the internal travel engine.*

### 4. Run the application
Run the root startup script:
```bash
python run.py
```
Or start directly from the backend directory:
```bash
cd backend
python app.py
```

Then open your browser at:
```
http://127.0.0.1:5000
```

---

## API Endpoints

- `GET /` — Serves the main application.
- `GET /api/health` — Basic health check endpoint.
- `POST /api/plan` — Generates a trip plan.
  - **Body**:
    ```json
    {
      "destination": "Tokyo",
      "duration": 4,
      "style": "Budget",
      "apiKey": ""
    }
    ```

---

## Submission Checklist

- [x] Single repository containing both `frontend` and `backend` directories.
- [x] Both `frontend/` and `backend/` folders clearly separated.
- [x] Tested locally and confirmed working.
- [ ] Repository set to **Public** visibility on GitHub.
- [ ] Link tested in an Incognito/Private window.
- [ ] Submitted on the 75way Recruit App before the deadline.
