let currentTrip = null;
let activeDay = 1;
let savedTrips = [];
let budgetChartInstance = null;
let isGenerating = false;

const destinationInput = document.getElementById("destination");
const durationSelect = document.getElementById("duration");
const styleSelect = document.getElementById("style");
const apiKeyInput = document.getElementById("api-key");
const generateBtn = document.getElementById("generate-btn");
const saveTripBtn = document.getElementById("save-trip-btn");
const savedTripsList = document.getElementById("saved-trips-list");
const tripTitle = document.getElementById("trip-title");
const tripSubtitle = document.getElementById("trip-subtitle");
const tripDays = document.getElementById("trip-days");
const tripStyle = document.getElementById("trip-style");

const agentSpinner = document.getElementById("agent-spinner");
const overlayConsoleLogs = document.getElementById("overlay-console-logs");
const agentTerminalLogs = document.getElementById("agent-terminal-logs");
const consoleStatusBadge = document.getElementById("console-status-badge");

const chatMessages = document.getElementById("chat-messages");
const chatUserInput = document.getElementById("chat-user-input");
const chatSendBtn = document.getElementById("chat-send-btn");

const itineraryDayTabs = document.getElementById("itinerary-day-tabs");
const itineraryTimeline = document.getElementById("itinerary-timeline");
const weatherSummary = document.getElementById("weather-summary");
const packingChecklist = document.getElementById("packing-checklist");
const packingProgress = document.getElementById("packing-progress");
const budgetTotalText = document.getElementById("budget-total-text");

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    loadSavedTrips();
    // Load Tokyo on first visit
    generateItinerary(true);
});

function setupEventListeners() {
    // Quick select chips
    document.querySelectorAll(".quick-chips .chip").forEach(chip => {
        chip.addEventListener("click", (e) => {
            document.querySelectorAll(".quick-chips .chip").forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            destinationInput.value = e.target.getAttribute("data-dest");
        });
    });

    // Accordion advanced trigger
    const advTrigger = document.getElementById("advancedTrigger");
    const advContent = document.getElementById("advancedContent");
    if (advTrigger && advContent) {
        advTrigger.addEventListener("click", () => {
            advTrigger.classList.toggle("expanded");
            advContent.classList.toggle("open");
        });
    }

    // Generate Button
    generateBtn.addEventListener("click", () => generateItinerary(false));

    // Save Trip Button
    saveTripBtn.addEventListener("click", saveCurrentTrip);

    // Chat Message Event Handlers
    chatSendBtn.addEventListener("click", sendChatMessage);
    chatUserInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendChatMessage();
    });
}

// API Base URL Resolver
const getApiBaseUrl = () => {
    // If running standalone or on separate dev port (e.g., 3000, 5500, 8080), route API calls to backend port 5000
    if (window.location.protocol === 'file:' || (window.location.port !== '5000' && window.location.port !== '5005' && window.location.port !== '')) {
        return 'http://127.0.0.1:5000';
    }
    return '';
};

// Fetch Plan from API
async function generateItinerary(isInitial = false) {
    if (isGenerating) return;
    
    const destination = destinationInput.value.trim();
    const duration = parseInt(durationSelect.value);
    const style = styleSelect.value;
    const apiKey = apiKeyInput.value.trim();

    if (!destination) {
        alert("Please enter a valid destination.");
        return;
    }

    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
    
    // Reset Terminal UI & Show loading screen
    clearTerminal();
    updateConsoleStatus("Active", true);
    showLoaderOverlay(true);

    try {
        const payload = {
            destination: destination,
            duration: duration,
            style: style,
            apiKey: apiKey
        };

        const apiUrl = `${getApiBaseUrl()}/api/plan`;
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Animate the Agent Execution Logs first before loading results to show the Agentic reasoning flow!
        await animateTerminalLogs(data.logs);
        
        // Save state and render details
        currentTrip = data.trip;
        activeDay = 1;
        
        renderTripDashboard();
        saveTripBtn.disabled = false;
        
        appendChatMessage("assistant", `I've prepared a **${currentTrip.duration}-day** trip plan for **${currentTrip.destination}** (${currentTrip.style} style). You can browse the daily schedule, route map, packing checklist, and estimated budget below. Feel free to ask if you'd like any changes!`);

    } catch (error) {
        console.error("Error generating trip:", error);
        writeTerminalLine("error-line", `> Error: ${error.message}`);
        appendChatMessage("assistant", "Could not complete the request. Please make sure the backend server is running and try again.");
    } finally {
        isGenerating = false;
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Itinerary';
        showLoaderOverlay(false);
        updateConsoleStatus("Idle", false);
    }
}

function clearTerminal() {
    overlayConsoleLogs.innerHTML = "";
    agentTerminalLogs.innerHTML = "";
}

function writeTerminalLine(type, text) {
    const line = document.createElement("div");
    line.className = `terminal-line ${type}-line`;
    line.textContent = text;
    
    const clone = line.cloneNode(true);
    agentTerminalLogs.appendChild(line);
    overlayConsoleLogs.appendChild(clone);
    
    agentTerminalLogs.scrollTop = agentTerminalLogs.scrollHeight;
    overlayConsoleLogs.scrollTop = overlayConsoleLogs.scrollHeight;
}

async function animateTerminalLogs(logs) {
    for (const log of logs) {
        let type = "system";
        let text = "";

        if (log.type === "thought") {
            type = "thought";
            text = log.message;
        } else if (log.type === "tool_call") {
            type = "tool-call";
            text = `Calling: ${log.tool}(${JSON.stringify(log.args)})`;
        } else if (log.type === "tool_output") {
            type = "tool-output";
            text = `Output: ${log.result}`;
        } else if (log.type === "message") {
            type = "message";
            text = log.message;
        } else {
            text = log.message || "";
        }

        writeTerminalLine(type, text);
        const wait = log.type === "tool_call" ? 500 : log.type === "tool_output" ? 350 : 250;
        await new Promise(resolve => setTimeout(resolve, wait));
    }
}

function showLoaderOverlay(show) {
    if (show) {
        agentSpinner.classList.remove("hidden");
    } else {
        agentSpinner.classList.add("hidden");
    }
}

function updateConsoleStatus(text, isActive) {
    consoleStatusBadge.textContent = text;
    consoleStatusBadge.className = isActive ? "badge console-status active" : "badge console-status";
}

// Renders the entire dashboard using currentTrip state
function renderTripDashboard() {
    if (!currentTrip) return;

    // Header updates
    tripTitle.textContent = `Voyage Plan: ${currentTrip.destination}`;
    tripSubtitle.innerHTML = `<span id="trip-days">${currentTrip.duration}</span> Days • <span id="trip-style">${currentTrip.style}</span> Trip`;
    
    // Map view initialization
    if (currentTrip.coordinates && currentTrip.coordinates.length === 2) {
        initMap(currentTrip.coordinates[0], currentTrip.coordinates[1]);
    }

    // Weather Panel update
    weatherSummary.textContent = currentTrip.weather || "Pleasant, moderate temperatures.";

    // Day tabs rendering
    renderDayTabs();

    // Itinerary rendering for activeDay
    renderItineraryForDay(activeDay);

    // Packing list rendering
    renderPackingList();

    // Budget chart rendering
    renderBudgetChart(currentTrip.budget);
}

// Render tabs for itinerary days
function renderDayTabs() {
    itineraryDayTabs.innerHTML = "";
    for (let d = 1; d <= currentTrip.duration; d++) {
        const tab = document.createElement("button");
        tab.className = `day-tab ${d === activeDay ? 'active' : ''}`;
        tab.textContent = `Day ${d}`;
        tab.addEventListener("click", () => {
            document.querySelectorAll(".day-tabs .day-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeDay = d;
            renderItineraryForDay(d);
        });
        itineraryDayTabs.appendChild(tab);
    }
}

// Render schedule items for specific day
function renderItineraryForDay(dayIndex) {
    itineraryTimeline.innerHTML = "";
    
    const dayData = currentTrip.itinerary.find(d => d.day === dayIndex);
    if (!dayData) {
        itineraryTimeline.innerHTML = '<div class="empty-message">No itinerary data for this day.</div>';
        return;
    }

    // Append day theme/title banner
    const themeBanner = document.createElement("div");
    themeBanner.className = "day-theme-banner";
    themeBanner.innerHTML = `<div style="font-size:0.75rem; color: var(--color-primary); font-weight:700; text-transform:uppercase;">Day ${dayIndex} Theme</div><h4 style="font-size: 0.95rem; margin-bottom: 8px;">${dayData.theme}</h4>`;
    itineraryTimeline.appendChild(themeBanner);

    // Filter and display activities
    dayData.activities.forEach(act => {
        const item = document.createElement("div");
        let catClass = 'sightseeing';
        const category = (act.category || '').toLowerCase();
        if (category.includes('dine') || category.includes('dining') || category.includes('food') || category.includes('eat')) {
            catClass = 'dining';
        } else if (category.includes('hotel') || category.includes('stay') || category.includes('lodging') || category.includes('accommodation')) {
            catClass = 'hotel';
        } else if (category.includes('shop') || category.includes('store') || category.includes('mall')) {
            catClass = 'shopping';
        }

        item.className = `timeline-item ${catClass}`;
        
        let badgeIcon = '<i class="fa-solid fa-camera"></i>';
        if (catClass === 'dining') badgeIcon = '<i class="fa-solid fa-utensils"></i>';
        if (catClass === 'hotel') badgeIcon = '<i class="fa-solid fa-bed"></i>';
        if (catClass === 'shopping') badgeIcon = '<i class="fa-solid fa-bag-shopping"></i>';

        item.innerHTML = `
            <div class="timeline-badge">${badgeIcon}</div>
            <div class="timeline-content">
                <div class="timeline-time">${act.time}</div>
                <div class="timeline-title">
                    <span>${act.title}</span>
                    <span class="timeline-cost">${act.cost > 0 ? `$${act.cost}` : 'Free'}</span>
                </div>
                <div class="timeline-desc">${act.description}</div>
            </div>
        `;

        // Click to focus map
        item.addEventListener("click", () => {
            if (act.coordinates && act.coordinates.length === 2) {
                focusOnMarker(act.coordinates[0], act.coordinates[1]);
            }
        });

        itineraryTimeline.appendChild(item);
    });

    // Draw markers on Leaflet map
    updateMapMarkers(dayData.activities);
}

// Render Packing Checklist items
function renderPackingList() {
    packingChecklist.innerHTML = "";
    
    if (!currentTrip.packing_list || currentTrip.packing_list.length === 0) {
        packingChecklist.innerHTML = '<li class="empty-message">No checklist loaded</li>';
        packingProgress.textContent = "0/0";
        return;
    }

    let checkedCount = 0;
    currentTrip.packing_list.forEach((item, index) => {
        if (item.checked) checkedCount++;
        
        const li = document.createElement("li");
        li.className = `packing-item ${item.checked ? 'checked' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" id="pack-chk-${index}" ${item.checked ? 'checked' : ''}>
            <span>${item.item}</span>
            <span class="category-tag">${item.category}</span>
        `;
        
        // Toggle item status
        li.querySelector("input").addEventListener("change", (e) => {
            item.checked = e.target.checked;
            li.classList.toggle("checked", e.target.checked);
            updatePackingProgress();
        });

        packingChecklist.appendChild(li);
    });

    updatePackingProgress();
}

function updatePackingProgress() {
    const total = currentTrip.packing_list.length;
    const checked = currentTrip.packing_list.filter(item => item.checked).length;
    packingProgress.textContent = `${checked}/${total}`;
}

// Render/Draw Doughnut chart for budget categories
function renderBudgetChart(budget) {
    budgetTotalText.textContent = `${budget.currency || '$'}${budget.total}`;
    
    const ctx = document.getElementById("budget-chart").getContext("2d");

    if (budgetChartInstance) {
        budgetChartInstance.destroy();
    }

    const categories = Object.keys(budget.categories);
    const values = Object.values(budget.categories);

    // Color definitions
    const colors = [
        '#00f2fe', // Transport - Cyan
        '#10b981', // Accommodation - Green
        '#f43f5e', // Food - Red
        '#f59e0b', // Activities - Amber
        '#8b5cf6'  // Miscellaneous - Violet
    ];

    budgetChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: $${context.raw}`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Chat interface functions
function appendChatMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    
    let icon = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
    
    msg.innerHTML = `
        <div class="avatar">${icon}</div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Agent Response for Custom modifications over chat
async function sendChatMessage() {
    const text = chatUserInput.value.trim();
    if (!text) return;

    appendChatMessage("user", text);
    chatUserInput.value = "";

    // Show AI status in terminal console
    updateConsoleStatus("Active", true);
    
    // Add small agent response loader bubble
    const loadingBubble = document.createElement("div");
    loadingBubble.className = "message assistant chat-loading-bubble";
    loadingBubble.innerHTML = `
        <div class="avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="message-content">
            <p><i class="fa-solid fa-circle-notch fa-spin"></i> Agent analyzing request...</p>
        </div>
    `;
    chatMessages.appendChild(loadingBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Process agentic alterations locally (rule-based agent engine to adapt UI instantly!)
    setTimeout(async () => {
        // Remove loading bubble
        chatMessages.removeChild(loadingBubble);

        const promptText = text.toLowerCase();
        let agentLogs = [];
        let reply = "";
        let modified = false;

        if (promptText.includes("museum") || promptText.includes("culture") || promptText.includes("art")) {
            agentLogs = [
                { type: "thought", message: `Processing user chat modifier: '${text}'.` },
                { type: "tool_call", tool: "scan_itinerary_schedule", args: { activeDay: activeDay } },
                { type: "tool_output", tool: "scan_itinerary_schedule", result: `Retrieved Day ${activeDay} details.` },
                { type: "thought", message: "Updating schedule nodes. Substituting general sightseeing with art/history museums." },
                { type: "tool_call", tool: "query_local_venues", args: { query: "top museums nearby", limit: 2 } },
                { type: "tool_output", tool: "query_local_venues", result: "Found: Local Art Gallery, Heritage Museum Center." },
                { type: "thought", message: "Recalculating routing bounds and updating timeline parameters." },
                { type: "message", message: "Schedule adjustment complete." }
            ];

            // Modify active day itinerary locally
            const dayData = currentTrip.itinerary.find(d => d.day === activeDay);
            if (dayData) {
                dayData.theme = "Galleries & Historical Exhibitions";
                dayData.activities[0] = {
                    time: "Morning",
                    title: "Modern Art & Cultural Exhibition",
                    description: "Wander through a world-class exhibition showcasing historical artifacts, oil paintings, and contemporary designs.",
                    category: "Sightseeing",
                    cost: 15,
                    coordinates: [currentTrip.coordinates[0] + 0.005, currentTrip.coordinates[1] - 0.004]
                };
                dayData.activities[1] = {
                    time: "Afternoon",
                    title: "Central Museum Sculpture Stroll",
                    description: "Take a walking guide through the central museum pavilion and adjacent sculpture gardens.",
                    category: "Sightseeing",
                    cost: 12,
                    coordinates: [currentTrip.coordinates[0] - 0.008, currentTrip.coordinates[1] + 0.006]
                };
                modified = true;
            }
            reply = `I have adjusted your **Day ${activeDay}** itinerary to focus on **museums & art galleries**, recalculated the transport routing path, and updated your budget analysis.`;
            
        } else if (promptText.includes("luxury") || promptText.includes("expensive") || promptText.includes("premium")) {
            agentLogs = [
                { type: "thought", message: "User requested luxury modifications." },
                { type: "tool_call", tool: "reallocate_budget_style", args: { target_style: "luxury" } },
                { type: "tool_output", tool: "reallocate_budget_style", result: "Accommodation and Dining variables increased by 180%." },
                { type: "thought", message: "Upgrading hotels to 5-star properties and restaurants to gourmet/Michelin fine dining." },
                { type: "message", message: "Trip class upgraded to Luxury." }
            ];

            // Scale budget & modify hotel activities
            currentTrip.style = "Luxury";
            currentTrip.budget.categories["Accommodation"] = Math.round(currentTrip.budget.categories["Accommodation"] * 2.0);
            currentTrip.budget.categories["Food & Dining"] = Math.round(currentTrip.budget.categories["Food & Dining"] * 1.8);
            currentTrip.budget.categories["Activities"] = Math.round(currentTrip.budget.categories["Activities"] * 1.5);
            currentTrip.budget.total = Object.values(currentTrip.budget.categories).reduce((a, b) => a + b, 0);

            // Find all Dining/Hotel activities and upgrade text
            currentTrip.itinerary.forEach(day => {
                day.activities.forEach(act => {
                    if (act.category.toLowerCase().includes("dine") || act.category.toLowerCase().includes("dining")) {
                        act.title = "Michelin Star Fine Dining Experience";
                        act.description = "Indulge in a premium seasonal multi-course tasting menu prepared by award-winning chefs.";
                        act.cost = Math.round(act.cost * 2.2 + 25);
                    }
                    if (act.category.toLowerCase().includes("hotel") || act.category.toLowerCase().includes("stay")) {
                        act.title = "Luxury 5-Star Hotel & Spa Stay";
                        act.description = "Unwind in an executive suite overlooking spectacular panoramic views, featuring full concierge services.";
                        act.cost = Math.round(act.cost * 2.5);
                    }
                });
            });
            modified = true;
            reply = "I've upgraded your itinerary style to **Luxury**! I recalculated the accommodations to feature premium 5-star properties, fine-dining restaurants, and adjusted the financial analysis chart.";

        } else if (promptText.includes("cheap") || promptText.includes("budget") || promptText.includes("lower")) {
            agentLogs = [
                { type: "thought", message: "User requested budget reductions." },
                { type: "tool_call", tool: "minimize_budget_factors", args: { target: "minimum_viable" } },
                { type: "tool_output", tool: "minimize_budget_factors", result: "Accommodations swapped to Hostels/Homestays. Dining targeted at local street markets." },
                { type: "thought", message: "Updating timeline records to prioritize free entry attractions." },
                { type: "message", message: "Budget calculations optimized." }
            ];

            currentTrip.style = "Budget";
            currentTrip.budget.categories["Accommodation"] = Math.round(currentTrip.budget.categories["Accommodation"] * 0.4);
            currentTrip.budget.categories["Food & Dining"] = Math.round(currentTrip.budget.categories["Food & Dining"] * 0.5);
            currentTrip.budget.categories["Activities"] = Math.round(currentTrip.budget.categories["Activities"] * 0.3);
            currentTrip.budget.total = Object.values(currentTrip.budget.categories).reduce((a, b) => a + b, 0);

            currentTrip.itinerary.forEach(day => {
                day.activities.forEach(act => {
                    if (act.category.toLowerCase().includes("dine") || act.category.toLowerCase().includes("dining")) {
                        act.title = "Local Street Food & Market Stalls";
                        act.description = "Sample highly-rated, affordable regional street specialties and local snacks.";
                        act.cost = Math.round(act.cost * 0.4);
                    }
                    if (act.category.toLowerCase().includes("hotel") || act.category.toLowerCase().includes("stay")) {
                        act.title = "Cozy Boutique Hostel / Homestay";
                        act.description = "Convenient, highly-rated lodging in a central location, offering comfortable amenities.";
                        act.cost = Math.round(act.cost * 0.3);
                    }
                    if (act.category.toLowerCase().includes("sightseeing")) {
                        act.cost = 0; // prioritize free entry
                    }
                });
            });
            modified = true;
            reply = "I have successfully optimized the trip for a tight **Budget**. I've adjusted lodging details to affordable boutique hostelling, dining to authentic street markets, and trimmed admissions to zero-cost landmarks.";
            
        } else {
            // General chatbot replies
            agentLogs = [
                { type: "thought", message: `Processing query: '${text}'` },
                { type: "tool_call", tool: "natural_language_processor", args: { text: text } },
                { type: "tool_output", tool: "natural_language_processor", result: "No structural database modifications required. Replying conversationally." }
            ];
            reply = `I can modify itineraries dynamically! Try commands like:
            <br>• *"Change Day ${activeDay} to focus on museums"*
            <br>• *"Upgrade my trip style to luxury"*
            <br>• *"Optimize this plan for a low budget"*`;
        }

        // Animate console steps first
        await animateTerminalLogs(agentLogs);
        
        // Refresh views
        if (modified) {
            renderTripDashboard();
        }

        appendChatMessage("assistant", reply);
        updateConsoleStatus("Idle", false);

    }, 1200);
}

// LocalStorage Saved Trips Managers
function loadSavedTrips() {
    savedTripsList.innerHTML = "";
    
    try {
        const stored = localStorage.getItem("roamify_saved_trips");
        if (stored) {
            savedTrips = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Could not parse saved trips:", e);
        savedTrips = [];
    }

    if (savedTrips.length === 0) {
        savedTripsList.innerHTML = '<li class="empty-message">No saved trips yet</li>';
        return;
    }

    savedTrips.forEach((trip, idx) => {
        const li = document.createElement("li");
        li.className = "saved-trip-item";
        
        li.innerHTML = `
            <div class="saved-trip-info">
                <h4>${trip.destination}</h4>
                <p>${trip.duration} days • ${trip.style}</p>
            </div>
            <button class="delete-trip-btn" data-index="${idx}"><i class="fa-solid fa-trash"></i></button>
        `;

        // Click list item to load trip
        li.addEventListener("click", (e) => {
            if (e.target.closest(".delete-trip-btn")) return; // skip if deleting
            
            currentTrip = trip;
            activeDay = 1;
            renderTripDashboard();
            appendChatMessage("assistant", `Loaded saved trip layout: **${trip.destination}**.`);
        });

        // Click trash to delete
        li.querySelector(".delete-trip-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteSavedTrip(idx);
        });

        savedTripsList.appendChild(li);
    });
}

function saveCurrentTrip() {
    if (!currentTrip) return;

    // Check if trip already exists
    const exists = savedTrips.some(t => 
        t.destination === currentTrip.destination && 
        t.duration === currentTrip.duration && 
        t.style === currentTrip.style
    );

    if (exists) {
        alert("This trip layout is already saved!");
        return;
    }

    savedTrips.push(currentTrip);
    localStorage.setItem("roamify_saved_trips", JSON.stringify(savedTrips));
    loadSavedTrips();
    
    // Animate visual confirmation
    saveTripBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
    setTimeout(() => {
        saveTripBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Save Current Trip';
    }, 2000);
}

function deleteSavedTrip(index) {
    if (confirm("Are you sure you want to delete this trip?")) {
        savedTrips.splice(index, 1);
        localStorage.setItem("roamify_saved_trips", JSON.stringify(savedTrips));
        loadSavedTrips();
    }
}

// -------------------------------------------------------------
// Interactive Travel Constellation Particle Background (Roamify)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("travel-particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Re-adjust sizing on resize
    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const colors = ["#0ea5e9", "#2563eb", "#d946ef", "#8b5cf6", "#3b82f6"];
    const destinations = [
        "Tokyo", "Paris", "Bali", "New York", "Rome", "London", 
        "Sydney", "Cairo", "Reykjavik", "Rio de Janeiro", "Cape Town"
    ];

    const nodes = [];
    const nodeCount = Math.min(24, Math.floor((width * height) / 45000) + 8);

    // Initialize Nodes
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            name: destinations[i % destinations.length],
            pulse: Math.random() * Math.PI,
            pulseSpeed: 0.02 + Math.random() * 0.03
        });
    }

    // Active flight travelers running along connection routes
    const travelers = [];

    function spawnTraveler(nodeA, nodeB) {
        // Prevent excessive traveler duplication
        if (travelers.filter(t => t.from === nodeA).length > 2) return;
        
        travelers.push({
            from: nodeA,
            to: nodeB,
            progress: 0,
            speed: 0.003 + Math.random() * 0.005,
            color: nodeA.color
        });
    }

    // Main animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw dynamic grid lines background (very faint)
        ctx.strokeStyle = "rgba(14, 165, 233, 0.03)";
        ctx.lineWidth = 1;
        const gridSize = 80;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // 1. Update and Draw Connections
        ctx.lineWidth = 0.8;
        for (let i = 0; i < nodes.length; i++) {
            const nodeA = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeB = nodes[j];
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // If nodes are reasonably close, draw connection line (flight path)
                if (dist < 220) {
                    const alpha = (1 - dist / 220) * 0.1;
                    ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(nodeB.x, nodeB.y);
                    ctx.stroke();

                    // Periodically spawn a traveler between connected nodes
                    if (Math.random() < 0.00035) {
                        spawnTraveler(nodeA, nodeB);
                    }
                }
            }
        }

        // 2. Update and Draw Flight Travelers (Light pulses)
        for (let i = travelers.length - 1; i >= 0; i--) {
            const t = travelers[i];
            t.progress += t.speed;

            if (t.progress >= 1) {
                travelers.splice(i, 1);
                continue;
            }

            // Calculate current position along the linear route
            const x = t.from.x + (t.to.x - t.from.x) * t.progress;
            const y = t.from.y + (t.to.y - t.from.y) * t.progress;

            // Draw glowing traveler dot
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = t.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = t.color;
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow
        }

        // 3. Update and Draw Nodes (Destinations)
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            node.pulse += node.pulseSpeed;

            // Bounce boundary checks
            if (node.x < 0 || node.x > width) node.vx *= -1;
            if (node.y < 0 || node.y > height) node.vy *= -1;

            // Scale radius slightly for heartbeat/pulsing effect
            const currentRadius = node.radius + Math.sin(node.pulse) * 0.8;

            // Draw connection halo glow
            ctx.beginPath();
            ctx.arc(node.x, node.y, currentRadius * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.globalAlpha = 0.04 + Math.sin(node.pulse) * 0.02;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Draw main node core
            ctx.beginPath();
            ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.shadowBlur = 4;
            ctx.shadowColor = node.color;
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow

            // Draw subtle destination name label near core
            ctx.fillStyle = "rgba(71, 85, 105, 0.45)";
            ctx.font = "8px 'Outfit', sans-serif";
            ctx.fillText(node.name, node.x + 8, node.y + 3);
        });

        requestAnimationFrame(animate);
    }

    animate();
});

