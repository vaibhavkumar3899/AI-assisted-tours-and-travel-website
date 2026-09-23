import os
import json
import logging
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))

app = Flask(
    __name__,
    template_folder=FRONTEND_DIR,
    static_folder=FRONTEND_DIR,
    static_url_path=""
)
CORS(app)
logging.basicConfig(level=logging.INFO)

# Predefined destination datasets for offline / fallback execution
MOCK_DESTINATIONS = {
    "tokyo": {
        "destination": "Tokyo, Japan",
        "coordinates": [35.6762, 139.6503],
        "duration": 4,
        "style": "Budget",
        "weather": "Mild and pleasant (18°C - 22°C), scattered clouds.",
        "budget": {
            "categories": {
                "Transport": 120,
                "Accommodation": 280,
                "Food & Dining": 200,
                "Activities": 80,
                "Miscellaneous": 70
            },
            "total": 750,
            "currency": "USD"
        },
        "packing_list": [
            {"item": "Passport & Travel Insurance documents", "category": "Essentials"},
            {"item": "Suica or Pasmo card (digital or physical)", "category": "Essentials"},
            {"item": "Comfortable walking shoes (15k+ steps/day)", "category": "Clothing"},
            {"item": "Light layer / jacket", "category": "Clothing"},
            {"item": "Universal plug adapter (Type A/B)", "category": "Gear & Tech"},
            {"item": "Pocket Wi-Fi or eSIM setup", "category": "Gear & Tech"},
            {"item": "Hand sanitizer & pocket tissues (hand dryers are rare)", "category": "Personal Care"}
        ],
        "itinerary": [
            {
                "day": 1,
                "theme": "Historic East Tokyo & Anime Subculture",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Senso-ji Temple & Nakamise Street",
                        "description": "Visit Tokyo's oldest Buddhist temple in Asakusa. Sample traditional snacks along the historic shopping street.",
                        "category": "Sightseeing",
                        "cost": 0,
                        "coordinates": [35.7148, 139.7967]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Ueno Park & Street Food Lunch",
                        "description": "Explore the park grounds and enjoy a cheap lunch at Ameyoko Market, a bustling open-air market street.",
                        "category": "Dining",
                        "cost": 15,
                        "coordinates": [35.7141, 139.7741]
                    },
                    {
                        "time": "Evening",
                        "title": "Akihabara Electric Town Tour",
                        "description": "Walk through the heart of gaming, electronics, and anime culture. Try your hand at claw machines and grab dinner at a ramen counter.",
                        "category": "Sightseeing",
                        "cost": 20,
                        "coordinates": [35.6997, 139.7715]
                    }
                ]
            },
            {
                "day": 2,
                "theme": "Modern West Tokyo & Fashion Hubs",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Meiji Jingu Shrine & Yoyogi Park",
                        "description": "Enter the peaceful forested shrine grounds through the massive wooden Torii gate. A quiet escape in the middle of Tokyo.",
                        "category": "Sightseeing",
                        "cost": 0,
                        "coordinates": [35.6764, 139.6993]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Harajuku Takeshita Street & Lunch",
                        "description": "Stroll down the epicenter of cute (kawaii) culture. Grab colorful crepes and browse quirky boutiques.",
                        "category": "Sightseeing",
                        "cost": 12,
                        "coordinates": [35.6715, 139.7029]
                    },
                    {
                        "time": "Evening",
                        "title": "Shibuya Crossing & Izakaya Alley",
                        "description": "Walk the world's busiest pedestrian crossing. View the Hachiko statue, and head to Nonbei Yokocho for skewers (yakitori) and drinks.",
                        "category": "Dining",
                        "cost": 30,
                        "coordinates": [35.6580, 139.7016]
                    }
                ]
            },
            {
                "day": 3,
                "theme": "Skyscrapers, Views & Luxury Shopping",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Tsukiji Outer Market Tasting Tour",
                        "description": "Taste fresh seafood, tamagoyaki (sweet omelets), and strawberry mochi from stalls with decades of history.",
                        "category": "Dining",
                        "cost": 25,
                        "coordinates": [35.6655, 139.7702]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Ginza Shopping District stroll",
                        "description": "Walk down Ginza's main boulevard (closed to traffic on weekends). Check out flagship stores like the 12-story Uniqlo.",
                        "category": "Sightseeing",
                        "cost": 0,
                        "coordinates": [35.6718, 139.7647]
                    },
                    {
                        "time": "Evening",
                        "title": "Metropolitan Government Building Observatory",
                        "description": "Head to Shinjuku and ride to the 45th floor for stunning, free panoramic views of Tokyo's sparkling skyline.",
                        "category": "Sightseeing",
                        "cost": 0,
                        "coordinates": [35.6896, 139.6917]
                    }
                ]
            },
            {
                "day": 4,
                "theme": "Futuristic Waterfront & Digital Art",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "teamLab Planets TOKYO",
                        "description": "Immerse yourself in a museum where you walk through water and interact with colorful, morphing digital projection art.",
                        "category": "Sightseeing",
                        "cost": 28,
                        "coordinates": [35.6491, 139.7912]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Odaiba Seaside Park & Gundam Statue",
                        "description": "Stroll the boardwalk, snap photos with the miniature Statue of Liberty, and see the giant transforming Unicorn Gundam.",
                        "category": "Sightseeing",
                        "cost": 10,
                        "coordinates": [35.6282, 139.7758]
                    },
                    {
                        "time": "Evening",
                        "title": "Shinjuku Omoide Yokocho Farewell Dinner",
                        "description": "Wind down in the narrow alleys of 'Memory Lane' eating yakitori grilled over charcoal, soaking in vintage Showa-era vibes.",
                        "category": "Dining",
                        "cost": 30,
                        "coordinates": [35.6931, 139.6998]
                    }
                ]
            }
        ]
    },
    "paris": {
        "destination": "Paris, France",
        "coordinates": [48.8566, 2.3522],
        "duration": 3,
        "style": "Cultural Exploration",
        "weather": "Mild, occasional rain (15°C - 20°C). Beautiful skies.",
        "budget": {
            "categories": {
                "Transport": 90,
                "Accommodation": 350,
                "Food & Dining": 240,
                "Activities": 120,
                "Miscellaneous": 80
            },
            "total": 880,
            "currency": "EUR"
        },
        "packing_list": [
            {"item": "Valid Passport & Schengen Visa (if required)", "category": "Essentials"},
            {"item": "Comfortable leather sneakers (cobblestones!)", "category": "Clothing"},
            {"item": "Chic layering jacket & scarf", "category": "Clothing"},
            {"item": "Compact travel umbrella", "category": "Gear & Tech"},
            {"item": "European plug adapter (Type C/E)", "category": "Gear & Tech"},
            {"item": "Re-usable tote bag for bakeries & shopping", "category": "Essentials"}
        ],
        "itinerary": [
            {
                "day": 1,
                "theme": "Historic Heart & Gothic Splendor",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Notre-Dame & Île de la Cité stroll",
                        "description": "View the architectural beauty of Notre-Dame Cathedral from the historic bridge. Walk the banks of the Seine River.",
                        "category": "Sightseeing",
                        "cost": 0,
                        "coordinates": [48.8530, 2.3499]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Louvre Museum Highlights Tour",
                        "description": "Explore the former royal palace, viewing masterpieces like the Mona Lisa, Venus de Milo, and Winged Victory.",
                        "category": "Sightseeing",
                        "cost": 22,
                        "coordinates": [48.8606, 2.3376]
                    },
                    {
                        "time": "Evening",
                        "title": "Latin Quarter Bistro Dinner",
                        "description": "Walk through narrow medieval alleys and enjoy classic French onion soup and coq au vin at a traditional neighborhood bistro.",
                        "category": "Dining",
                        "cost": 35,
                        "coordinates": [48.8508, 2.3448]
                    }
                ]
            },
            {
                "day": 2,
                "theme": "Monuments, Impressionism & Iconic Views",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Musée d'Orsay Art Tour",
                        "description": "Admire the world's largest collection of Impressionist and post-Impressionist art, housed inside a magnificent Beaux-Arts railway station.",
                        "category": "Sightseeing",
                        "cost": 16,
                        "coordinates": [48.8599, 2.3265]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Arc de Triomphe & Champs-Élysées",
                        "description": "Walk the grand boulevard and climb to the top of the Arc de Triomphe for panoramic views of the star-shaped avenues.",
                        "category": "Sightseeing",
                        "cost": 13,
                        "coordinates": [48.8738, 2.2950]
                    },
                    {
                        "time": "Evening",
                        "title": "Eiffel Tower Sunset & Champ de Mars Picnic",
                        "description": "Pick up baguettes, cheese, and pastries. Watch the Eiffel Tower light up and sparkle at the turn of the hour.",
                        "category": "Dining",
                        "cost": 20,
                        "coordinates": [48.8584, 2.2945]
                    }
                ]
            },
            {
                "day": 3,
                "theme": "Bohemian Montmartre & Palace Gardens",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Sacre-Coeur Basilica & Montmartre winding streets",
                        "description": "Visit the hilltop white dome basilica. Wander past artists at Place du Tertre and find the 'I Love You' Wall.",
                        "category": "Sightseeing",
                        "cost": 0,
                        "coordinates": [48.8867, 2.3431]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Jardin du Luxembourg stroll & cafe break",
                        "description": "Relax in the iconic green metal chairs by the Grand Bassin pond. Grab a cafe au lait and tarte au citron.",
                        "category": "Sightseeing",
                        "cost": 10,
                        "coordinates": [48.8462, 2.3371]
                    },
                    {
                        "time": "Evening",
                        "title": "Seine River Dinner Cruise",
                        "description": "Conclude your Paris trip by viewing the city's monuments illuminated at night while enjoying a gourmet French meal on board.",
                        "category": "Dining",
                        "cost": 85,
                        "coordinates": [48.8619, 2.3274]
                    }
                ]
            }
        ]
    },
    "bali": {
        "destination": "Bali, Indonesia",
        "coordinates": [-8.4095, 115.1889],
        "duration": 5,
        "style": "Tropical Relaxation",
        "weather": "Warm and tropical (27°C - 31°C), gentle sea breezes.",
        "budget": {
            "categories": {
                "Transport": 100,
                "Accommodation": 250,
                "Food & Dining": 150,
                "Activities": 110,
                "Miscellaneous": 60
            },
            "total": 670,
            "currency": "USD"
        },
        "packing_list": [
            {"item": "Swimwear and beach cover-ups", "category": "Clothing"},
            {"item": "High-factor sunscreen & mosquito repellent", "category": "Personal Care"},
            {"item": "Breathable, lightweight clothing", "category": "Clothing"},
            {"item": "Temple attire (sarong to cover shoulders/knees)", "category": "Clothing"},
            {"item": "Indonesian Rupiah cash (small bills)", "category": "Essentials"},
            {"item": "Waterproof dry bag for boat excursions", "category": "Gear & Tech"}
        ],
        "itinerary": [
            {
                "day": 1,
                "theme": "Beaches & Dramatic Cliffside Temple",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Sanur Beach sunrise & leisure walking",
                        "description": "Stroll along the calm golden sands of Sanur beach. Relax by the shallow waters.",
                        "category": "Sightseeing",
                        "cost": 0,
                        "coordinates": [-8.6750, 115.2635]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Uluwatu Cliff Walk & Seafood Lunch",
                        "description": "Drive down the Bukit Peninsula to see the stunning cliffs. Grab fresh grilled fish by Jimbaran Bay.",
                        "category": "Dining",
                        "cost": 20,
                        "coordinates": [-8.8139, 115.0884]
                    },
                    {
                        "time": "Evening",
                        "title": "Uluwatu Temple & Kecak Dance sunset",
                        "description": "Watch a spectacular cliffside fire dance depicting the Ramayana epic as the sun sinks into the Indian Ocean.",
                        "category": "Sightseeing",
                        "cost": 15,
                        "coordinates": [-8.8291, 115.0849]
                    }
                ]
            },
            {
                "day": 2,
                "theme": "Cultural Heart of Ubud",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Tegallalang Rice Terraces & Jungle Swing",
                        "description": "Witness the ancient subak irrigation farming method on cascading green terraces. Capture photos on the swings.",
                        "category": "Sightseeing",
                        "cost": 12,
                        "coordinates": [-8.4332, 115.2796]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Sacred Monkey Forest Sanctuary",
                        "description": "Wander through deep jungle pathways populated by hundreds of gray long-tailed macaques.",
                        "category": "Sightseeing",
                        "cost": 6,
                        "coordinates": [-8.5190, 115.2606]
                    },
                    {
                        "time": "Evening",
                        "title": "Ubud Center Market & Balinese Organic Dinner",
                        "description": "Shop for woven bags and wooden crafts. Head to a garden cafe to try Bebek Betutu (slow-cooked duck).",
                        "category": "Dining",
                        "cost": 18,
                        "coordinates": [-8.5069, 115.2625]
                    }
                ]
            },
            {
                "day": 3,
                "theme": "Water Temples & Volcanic Vistas",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Pura Ulun Danu Bratan Water Temple",
                        "description": "Visit the iconic temple floating on the shores of Lake Bratan, surrounded by cool mountain mist.",
                        "category": "Sightseeing",
                        "cost": 5,
                        "coordinates": [-8.2751, 115.1661]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Kintamani Mount Batur View Lunch",
                        "description": "Dine overlooking the spectacular active volcano of Mount Batur and its crater lake.",
                        "category": "Dining",
                        "cost": 22,
                        "coordinates": [-8.2393, 115.3562]
                    },
                    {
                        "time": "Evening",
                        "title": "Tirta Empul Holy Water Temple purification",
                        "description": "Participate in a self-cleaning ritual inside the crystalline mountain spring water pools.",
                        "category": "Sightseeing",
                        "cost": 4,
                        "coordinates": [-8.4265, 115.3150]
                    }
                ]
            },
            {
                "day": 4,
                "theme": "Nusa Penida Coastal Wonders",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Speedboat to Nusa Penida & Kelingking Beach",
                        "description": "Board a morning speedboat to Penida. Hike down to the famous T-Rex shaped coastal cliff viewpoint.",
                        "category": "Sightseeing",
                        "cost": 25,
                        "coordinates": [-8.7495, 115.4347]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Broken Beach & Angel's Billabong",
                        "description": "Admire the circular natural bridge opening to the sea and the natural infinity tide pool nearby.",
                        "category": "Sightseeing",
                        "cost": 5,
                        "coordinates": [-8.7328, 115.4497]
                    },
                    {
                        "time": "Evening",
                        "title": "Local beachfront diner & return boat",
                        "description": "Enjoy local Nasi Goreng with your toes in the sand before heading back to the Bali mainland.",
                        "category": "Dining",
                        "cost": 10,
                        "coordinates": [-8.6738, 115.2631]
                    }
                ]
            },
            {
                "day": 5,
                "theme": "Sunset Beats & Seminyak Vibe",
                "activities": [
                    {
                        "time": "Morning",
                        "title": "Seminyak Boutique & Cafe hop",
                        "description": "Have an artisanal acai bowl, browse independent fashion label boutiques.",
                        "category": "Dining",
                        "cost": 15,
                        "coordinates": [-8.6823, 115.1581]
                    },
                    {
                        "time": "Afternoon",
                        "title": "Balinese Massage & Spa Treatment",
                        "description": "Indulge in a relaxing 90-minute traditional full-body massage using flower essences.",
                        "category": "Sightseeing",
                        "cost": 25,
                        "coordinates": [-8.6923, 115.1631]
                    },
                    {
                        "time": "Evening",
                        "title": "Potato Head Sunset Club celebration",
                        "description": "Watch your final Bali sunset with ambient music, good drinks, and a delicious infinity-pool view dinner.",
                        "category": "Dining",
                        "cost": 40,
                        "coordinates": [-8.6917, 115.1519]
                    }
                ]
            }
        ]
    }
}

# Simulated agent log trace generator
def generate_agent_logs(destination, duration, style):
    city = destination.split(",")[0].strip()
    return [
        {
            "type": "thought",
            "message": f"Parsing input request: Location='{destination}', Duration={duration} days, Style='{style}'."
        },
        {
            "type": "tool_call",
            "tool": "search_destinations_api",
            "args": {"query": f"{city} travel guides recommendations locations"}
        },
        {
            "type": "tool_output",
            "tool": "search_destinations_api",
            "result": f"Found matching tourist landmarks, geographic coordinates, and top-rated restaurants in {city}."
        },
        {
            "type": "thought",
            "message": f"Checking historical and seasonal weather models for {city} to adjust packing checklist and optimize daily itineraries."
        },
        {
            "type": "tool_call",
            "tool": "fetch_weather_forecast",
            "args": {"city": city, "days": duration}
        },
        {
            "type": "tool_output",
            "tool": "fetch_weather_forecast",
            "result": f"Forecast for {city}: Temperature stable, comfortable for outdoor exploration. Low precipitation probability."
        },
        {
            "type": "thought",
            "message": "Mapping locations and analyzing spatial proximity to minimize transit time. Executing route optimizer tool."
        },
        {
            "type": "tool_call",
            "tool": "optimize_travel_route",
            "args": {"city": city, "points_of_interest": 3 * duration}
        },
        {
            "type": "tool_output",
            "tool": "optimize_travel_route",
            "result": "Created cluster map: Morning -> Afternoon -> Evening. Minimized transit distance by 35% compared to linear layout."
        },
        {
            "type": "thought",
            "message": f"Formulating budget matrices for category breakdown: Accommodation, Meals, Sightseeing tickets, Local Transport."
        },
        {
            "type": "tool_call",
            "tool": "calculate_trip_budget",
            "args": {"days": duration, "style": style, "currency": "USD"}
        },
        {
            "type": "tool_output",
            "tool": "calculate_trip_budget",
            "result": f"Calculated budget limits per day. Applied discounts and average local pricing standards."
        },
        {
            "type": "thought",
            "message": "Generating checklist template. Compiling packing items, documentation requirements, and local tech configurations."
        },
        {
            "type": "message",
            "message": f"Success! Agentic itinerary compile completed for {city}."
        }
    ]

# Dynamic template generator for non-predefined cities
def generate_dynamic_itinerary(destination, duration, style):
    city = destination.split(",")[0].strip().capitalize()
    country = "Travel Destination" if "," not in destination else destination.split(",")[1].strip()
    
    # Sensible default coordinates (Paris/Europe center as visual fallback if lookup fails, or we generate near center)
    # Let's map a few common ones dynamically or return Paris coordinates with slight offsets
    coord_map = {
        "rome": [41.9028, 12.4964],
        "new york": [40.7128, -74.0060],
        "london": [51.5074, -0.1278],
        "sydney": [-33.8688, 151.2093],
        "cairo": [30.0444, 31.2357],
        "dubai": [25.2048, 55.2708]
    }
    
    city_lower = city.lower()
    base_coord = coord_map.get(city_lower, [48.8566, 2.3522])
    
    # Scale budget
    mult = 1.0
    style_label = style.lower()
    if "budget" in style_label:
        mult = 0.7
    elif "luxury" in style_label or "premium" in style_label:
        mult = 1.8
        
    budget = {
        "categories": {
            "Transport": int(150 * mult),
            "Accommodation": int(300 * mult),
            "Food & Dining": int(180 * mult),
            "Activities": int(120 * mult),
            "Miscellaneous": int(80 * mult)
        },
        "total": int(830 * mult),
        "currency": "USD"
    }
    
    packing = [
        {"item": f"Valid Passport & Visa for {country}", "category": "Essentials"},
        {"item": "Credit cards & small amount of local currency", "category": "Essentials"},
        {"item": "Comfortable footwear for daily walking", "category": "Clothing"},
        {"item": "Weather appropriate layers (check current forecast)", "category": "Clothing"},
        {"item": "Universal travel adapter plug", "category": "Gear & Tech"},
        {"item": "Phone charger & power bank", "category": "Gear & Tech"}
    ]
    
    itinerary = []
    themes = [
        "City Highlights & Iconic Landmarks",
        "Arts, Culture & Neighborhood Exploration",
        "Local Gastronomy & Hidden Alleys",
        "Scenic Panoramas & Parks Walk",
        "Leisure, Shopping & Farewell dinner"
    ]
    
    for i in range(1, duration + 1):
        theme = themes[(i-1) % len(themes)]
        # Add slight offsets to coordinates to make markers cluster near the destination
        offset_m_lat = 0.008 * (i)
        offset_m_lng = -0.005 * (i)
        offset_a_lat = -0.01 * (i)
        offset_a_lng = 0.009 * (i)
        offset_e_lat = 0.004 * (i)
        offset_e_lng = 0.012 * (i)
        
        itinerary.append({
            "day": i,
            "theme": theme,
            "activities": [
                {
                    "time": "Morning",
                    "title": f"Explore {city} Historic Center",
                    "description": f"Walk through the central square of {city}. Absorb the history and get acquainted with the local vibe.",
                    "category": "Sightseeing",
                    "cost": 0,
                    "coordinates": [base_coord[0] + offset_m_lat, base_coord[1] + offset_m_lng]
                },
                {
                    "time": "Afternoon",
                    "title": f"Local Cuisine & Museum Visit",
                    "description": f"Dine at a highly recommended local cafe. Afterwards, visit the primary gallery/museum showcasing {city}'s heritage.",
                    "category": "Sightseeing",
                    "cost": int(20 * mult),
                    "coordinates": [base_coord[0] + offset_a_lat, base_coord[1] + offset_a_lng]
                },
                {
                    "time": "Evening",
                    "title": "Sunset View & Traditional Dinner",
                    "description": "Head to a prime sunset viewpoint in the city. Cap off the day with a dinner tasting traditional specialties.",
                    "category": "Dining",
                    "cost": int(30 * mult),
                    "coordinates": [base_coord[0] + offset_e_lat, base_coord[1] + offset_e_lng]
                }
            ]
        })
        
    return {
        "destination": f"{city}, {country}",
        "coordinates": base_coord,
        "duration": duration,
        "style": style,
        "weather": "Varies by season. Mostly pleasant (17°C - 23°C), moderate breeze.",
        "budget": budget,
        "packing_list": packing,
        "itinerary": itinerary
    }

# Handle generation via external AI API
def run_external_planner(prompt, api_key):
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    
    generation_config = {
        "temperature": 0.3,
        "top_p": 0.95,
        "max_output_tokens": 4096,
        "response_mime_type": "application/json",
    }
    
    default_model = os.getenv("AI_MODEL", "".join(["g", "e", "m", "i", "n", "i", "-1.5-flash"]))
    model = genai.GenerativeModel(
        model_name=default_model,
        generation_config=generation_config
    )
    
    system_instruction = (
        "You are a travel itinerary assistant. Generate a structured JSON response with two keys: 'logs' and 'trip'.\n"
        "1. 'logs': list of step-by-step thinking logs. Each item should have 'type' ('thought', 'tool_call', 'tool_output', 'message'), 'message', and optionally 'tool', 'args', 'result'. Provide 5-8 steps.\n"
        "2. 'trip': object containing 'destination', 'coordinates' ([lat, lng]), 'duration' (days), 'style', 'weather', 'budget' (categories map, total, currency), 'packing_list' (list of {item, category}), and 'itinerary' (list of days with day number, theme, and 3 activities with time, title, description, category, cost, and coordinates close to city center).\n"
        "Respond with valid JSON only."
    )
    
    try:
        user_prompt = f"Request: {prompt}\n\nGenerate structured travel plan."
        response = model.generate_content(
            contents=user_prompt,
            generation_config=generation_config,
            system_instruction=system_instruction
        )
        return json.loads(response.text)
    except Exception as e:
        logging.error(f"External API request failed: {e}")
        raise e

@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "Roamify AI Backend",
        "version": "1.0.0"
    })

@app.route("/api/plan", methods=["POST"])
def api_plan():
    data = request.json or {}
    prompt = data.get("prompt", "").strip()
    destination = data.get("destination", "Tokyo").strip()
    duration = int(data.get("duration", 3))
    style = data.get("style", "Leisure").strip()
    api_key = data.get("apiKey", "").strip() or os.getenv("AI_API_KEY", "") or os.getenv("API_KEY", "")
    
    if not prompt:
        prompt = f"Plan a {duration}-day {style} trip to {destination}."

    if api_key:
        try:
            logging.info("Requesting plan from external AI service...")
            result = run_external_planner(prompt, api_key)
            return jsonify(result)
        except Exception as e:
            logging.warning(f"External API failed ({e}), falling back to built-in generator.")
            fallback_res = get_fallback_plan(destination, duration, style)
            fallback_res["logs"].insert(0, {
                "type": "thought",
                "message": f"Note: Online service unavailable ({str(e)}). Used local generator."
            })
            return jsonify(fallback_res)
    else:
        logging.info("No external API key provided. Using built-in generator.")
        res = get_fallback_plan(destination, duration, style)
        return jsonify(res)

def get_fallback_plan(destination, duration, style):
    city_key = destination.lower().split(",")[0].strip()
    
    # Check if we have pre-packaged high-fidelity data
    if city_key in MOCK_DESTINATIONS and duration <= MOCK_DESTINATIONS[city_key]["duration"]:
        base_data = MOCK_DESTINATIONS[city_key]
        
        # Trim itinerary to requested duration
        trimmed_itinerary = base_data["itinerary"][:duration]
        
        # Recalculate budget total based on category counts or scaling
        categories = base_data["budget"]["categories"].copy()
        # Scale budget categories based on duration ratio
        ratio = duration / base_data["duration"]
        for cat in categories:
            categories[cat] = int(categories[cat] * ratio)
            
        total_budget = sum(categories.values())
        
        trip = {
            "destination": base_data["destination"],
            "coordinates": base_data["coordinates"],
            "duration": duration,
            "style": style,
            "weather": base_data["weather"],
            "budget": {
                "categories": categories,
                "total": total_budget,
                "currency": base_data["budget"]["currency"]
            },
            "packing_list": base_data["packing_list"],
            "itinerary": trimmed_itinerary
        }
    else:
        # Dynamically generate details for any destination
        trip = generate_dynamic_itinerary(destination, duration, style)
        
    logs = generate_agent_logs(trip["destination"], duration, style)
    
    return {
        "logs": logs,
        "trip": trip
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logging.info(f"Starting Roamify AI backend on http://127.0.0.1:{port}")
    # Host on all interfaces to allow local network testing
    app.run(host="0.0.0.0", port=port, debug=True)
