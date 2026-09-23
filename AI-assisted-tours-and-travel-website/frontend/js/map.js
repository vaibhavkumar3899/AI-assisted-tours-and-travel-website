let mapInstance = null;
let mapMarkers = [];
let routeLine = null;

const markerStyles = `
.custom-map-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2.5px solid #fff;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    background-color: var(--color-primary);
    transition: all 0.3s ease;
}
.custom-map-dot:hover {
    transform: scale(1.3);
    box-shadow: 0 0 12px currentColor;
}
.custom-map-dot.sightseeing { background-color: var(--color-success); box-shadow: 0 0 8px var(--color-success); }
.custom-map-dot.dining { background-color: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }
.custom-map-dot.hotel { background-color: var(--color-secondary); box-shadow: 0 0 8px var(--color-secondary); }
.custom-map-dot.shopping { background-color: var(--color-warning); box-shadow: 0 0 8px var(--color-warning); }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = markerStyles;
document.head.appendChild(styleSheet);

function initMap(lat, lng) {
    if (mapInstance) {
        mapInstance.remove();
    }

    mapInstance = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true,
        fadeAnimation: true
    }).setView([lat, lng], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(mapInstance);
}

/**
 * Update map markers and paths using itinerary activities
 */
function updateMapMarkers(activities) {
    if (!mapInstance) return;

    // Clear previous markers
    mapMarkers.forEach(marker => mapInstance.removeLayer(marker));
    mapMarkers = [];

    // Clear previous route lines
    if (routeLine) {
        mapInstance.removeLayer(routeLine);
        routeLine = null;
    }

    const latLngs = [];

    activities.forEach((act, idx) => {
        if (!act.coordinates || act.coordinates.length !== 2) return;
        const [lat, lng] = act.coordinates;
        
        // Match category for color styles
        let catClass = 'sightseeing';
        const category = (act.category || '').toLowerCase();
        if (category.includes('dine') || category.includes('dining') || category.includes('food') || category.includes('eat')) {
            catClass = 'dining';
        } else if (category.includes('hotel') || category.includes('stay') || category.includes('lodging') || category.includes('accommodation')) {
            catClass = 'hotel';
        } else if (category.includes('shop') || category.includes('store') || category.includes('mall')) {
            catClass = 'shopping';
        }

        // Create glowing HTML dot icon
        const customIcon = L.divIcon({
            html: `<div class="custom-map-dot ${catClass}"></div>`,
            className: 'custom-div-icon',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        // Popup Markup
        const popupContent = `
            <div class="custom-popup">
                <div class="custom-popup-time">${act.time}</div>
                <div class="custom-popup-title">${act.title}</div>
                <div style="font-size: 0.75rem; color: #94a3b8;">${act.description}</div>
                ${act.cost > 0 ? `<div style="font-weight: 600; margin-top: 4px; font-size: 0.75rem;">Cost: $${act.cost}</div>` : `<div style="color: #10b981; font-weight:600; margin-top: 4px; font-size: 0.75rem;">Free Entry</div>`}
            </div>
        `;

        // Create Marker
        const marker = L.marker([lat, lng], { icon: customIcon })
            .bindPopup(popupContent, {
                closeButton: false,
                offset: L.point(0, -6),
                className: 'custom-popup-wrapper'
            })
            .addTo(mapInstance);

        // Store reference
        mapMarkers.push(marker);
        latLngs.push([lat, lng]);
    });

    // Draw route path line if we have multiple stops
    if (latLngs.length > 1) {
        routeLine = L.polyline(latLngs, {
            color: '#00f2fe',
            weight: 3,
            opacity: 0.6,
            dashArray: '8, 8',
            lineJoin: 'round'
        }).addTo(mapInstance);
    }

    // Adjust map viewport bounds to fit all elements cleanly
    if (latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        mapInstance.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 14,
            animate: true,
            duration: 1.2
        });
    }
}

/**
 * Focus and zoom to a specific coordinate
 */
function focusOnMarker(lat, lng) {
    if (!mapInstance) return;

    // Find the marker that matches the coordinates
    const targetMarker = mapMarkers.find(marker => {
        const pos = marker.getLatLng();
        // Precision check up to 5 decimals
        return Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001;
    });

    // Smooth pan view
    mapInstance.panTo([lat, lng], {
        animate: true,
        duration: 0.8
    });

    // Open popup after panning
    if (targetMarker) {
        setTimeout(() => {
            targetMarker.openPopup();
        }, 400);
    }
}
