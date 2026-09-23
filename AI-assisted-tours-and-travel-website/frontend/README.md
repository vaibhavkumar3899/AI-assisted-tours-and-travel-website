# Roamify - Frontend Interface

Client-side interface for the travel planning web application. Built using semantic HTML5, custom CSS3 with a responsive dark layout, and vanilla JavaScript.

---

## Directory Overview

```text
frontend/
├── assets/             # Brand logos and icons
├── css/
│   └── style.css       # Layout, theme variables, and component styles
├── js/
│   ├── app.js          # App state, DOM manipulation, and API integration
│   └── map.js          # Leaflet.js map logic and marker rendering
├── index.html          # Application markup
├── package.json        # Frontend scripts
└── README.md
```

---

## Key Features

- **Leaflet.js Map Integration**: Interactive map that automatically centers on the selected city and renders color-coded activity markers for each day.
- **Budget Doughnut Chart**: Uses Chart.js to visually display estimated costs broken down by category (lodging, dining, transit, activities, etc.).
- **Interactive Packing List**: Checkbox-driven packing list tailored to the destination with a dynamic progress indicator.
- **Real-Time Log Terminal**: Step-by-step console view showing the planning engine's progress.

---

## Running Standalone (Optional)

The frontend is served automatically by the Flask backend at `http://127.0.0.1:5000`.

If you prefer to run the frontend independently using a static server:
```bash
cd frontend
npx serve -l 3000 .
```
The client script will automatically point API requests to the Flask backend running on port `5000`.
