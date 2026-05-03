import requests
import json
import random
import os
import string

def load_local_geojson(filepath="Data/export.geojson"):
    print(f"Loading REAL data from local GeoJSON file: {filepath}...")
    if not os.path.exists(filepath):
        print("GeoJSON file not found! Please place export.geojson in the Data folder.")
        return {"features": []}
        
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def generate_synthetic_database():
    geojson_data = load_local_geojson()
    
    # 1. Parse REAL GeoJSON Data into our structure
    real_gates = []
    real_amenities = {}
    
    for feature in geojson_data.get('features', []):
        properties = feature.get('properties', {})
        geometry = feature.get('geometry', {})
        
        name = properties.get('name', 'Unknown')
        
        # Extract coordinates (simplification: if polygon, just take first point)
        lat, lon = "Unknown", "Unknown"
        if geometry.get('type') == 'Point':
            lon, lat = geometry.get('coordinates', ["Unknown", "Unknown"])
        elif geometry.get('type') in ['Polygon', 'LineString'] and 'coordinates' in geometry:
            try:
                # Just grab the first coordinate pair of the shape for simple mapping
                coords = geometry['coordinates'][0]
                if isinstance(coords[0], list):
                    lon, lat = coords[0]
                else:
                    lon, lat = coords
            except:
                pass
                
        if 'aeroway' in properties and properties['aeroway'] == 'gate':
            gate_ref = properties.get('ref', f"Gate_{random.randint(10, 99)}")
            real_gates.append({
                "location": f"Gate {gate_ref}",
                "coordinates": f"{lat}, {lon}",
                "directions": f"From security, walk towards Concourse and follow signs for {gate_ref}. Latitude/Longitude: {lat}, {lon}"
            })
        elif 'amenity' in properties:
            amenity_type = properties['amenity']
            if name == 'Unknown':
                name = f"{amenity_type.capitalize()}_{random.randint(100,999)}"
            
            real_amenities[name] = {
                "type": amenity_type,
                "coordinates": f"{lat}, {lon}",
                "location": f"Terminal Area, Lat: {lat}, Lon: {lon}",
                "opening_hours": properties.get("opening_hours", "24/7"),
                "description": f"A {amenity_type} located inside the airport."
            }

    # 2. Generate Synthetic PNRs (Massive Scale)
    print("Generating 500 Synthetic PNRs and Flights...")
    airlines = ["AI", "6E", "UK", "QP"]
    cities = ["BOM", "BLR", "HYD", "CCU", "MAA", "DXB", "LHR", "JFK"]
    synthetic_pnrs = {}
    
    for _ in range(500):
        # Generate random 6 character PNR
        pnr = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        # Determine if there's a connecting flight
        has_connecting = random.choice([True, False])
        connecting_info = None
        if has_connecting:
            connecting_info = {
                "flight_number": f"{random.choice(airlines)} {random.randint(100, 999)}",
                "gate": f"{random.randint(1, 60)}{random.choice(['A', 'B', 'C', ''])}",
                "layover_time": f"{random.randint(1, 8)} hours",
                "destination": random.choice(cities)
            }
            
        synthetic_pnrs[pnr] = {
            "passenger_name": f"Passenger_{random.randint(1000, 9999)}",
            "flight_number": f"{random.choice(airlines)} {random.randint(100, 999)}",
            "status": random.choice(["On Time", "Delayed", "Boarding", "Gate Closed"]),
            "gate": f"{random.randint(1, 60)}{random.choice(['A', 'B', 'C', ''])}",
            "boarding_time": f"{random.randint(0, 23):02d}:{random.choice(['00', '15', '30', '45'])}",
            "destination": random.choice(cities),
            "connecting_flight": connecting_info
        }
        
    # Ensure our hardcoded XYZ123 test PNR is always there
    synthetic_pnrs["XYZ123"] = {
      "passenger_name": "John Doe",
      "flight_number": "AI 505",
      "status": "On Time",
      "gate": "5B",
      "boarding_time": "14:00",
      "destination": "BOM",
      "connecting_flight": {
        "flight_number": "AI 999",
        "gate": "12A",
        "layover_time": "2 hours",
        "destination": "LHR"
      }
    }

    # 3. Combine into Final Massive Database
    print("Combining Real OSM Data and Synthetic Data...")
    final_database = {
      "general_information": {
        "name": "Indira Gandhi International Airport",
        "code": "DEL",
        "terminals": ["Terminal 1", "Terminal 2", "Terminal 3"],
        "wifi": "Free WiFi available for 45 minutes via 'Tata Tele Wi-Fi'"
      },
      "real_airport_navigation_and_gates": real_gates if real_gates else [{"location": "Gate 5B", "directions": "From security, walk straight 200m."}],
      "real_food_and_amenities": real_amenities,
      "synthetic_passenger_protocols": {
        "first_time_flyers": "Please arrive 3 hours before departure. Check the display boards for your flight number. Have your ID and boarding pass ready at security.",
        "senior_citizens": "Free buggy service is available from check-in counters to boarding gates. Priority seating available at all gates. Wheelchair assistance can be requested at airline counters.",
        "baggage_rules": "Cabin bag up to 7kg. Check-in bag up to 15kg. Liquids must be in containers of 100ml or less."
      },
      "massive_pnr_database": synthetic_pnrs
    }

    # Write to File
    os.makedirs("Data", exist_ok=True)
    with open("Data/airport_knowledge.json", "w", encoding="utf-8") as f:
        json.dump(final_database, f, indent=2)
        
    print(f"Success! Data/airport_knowledge.json generated with {len(real_gates)} real gates, {len(real_amenities)} real amenities, and {len(synthetic_pnrs)} synthetic PNRs.")

if __name__ == "__main__":
    generate_synthetic_database()
    
    # Optional: Automatically trigger RAG to rebuild ChromaDB
    try:
        from Backend.RAGService import RAGService
        print("Rebuilding ChromaDB Vector Store...")
        rag = RAGService()
        print("Database successfully built into RAG Vector Store!")
    except Exception as e:
        print(f"Could not automatically rebuild vector store: {e}")
