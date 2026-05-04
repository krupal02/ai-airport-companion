import json
import os
import math
from collections import deque
from typing import Dict, List, Optional

class IndoorNavigationService:
    """Synthetic indoor navigation with step-by-step directions and time estimates."""

    def __init__(self):
        self.graph = self._build_airport_graph()
        self.poi_data = self._load_poi_data()

    def get_directions(self, from_zone: str, to_zone: str) -> Dict:
        """Get step-by-step walking directions between two zones."""
        # Normalize names for better matching
        f_norm = self._normalize_zone(from_zone)
        t_norm = self._normalize_zone(to_zone)
        
        path = self._bfs_path(f_norm, t_norm)
        
        # Determine the final target coordinates
        target_coords = self._get_location_coords(t_norm)
        start_coords = self._get_location_coords(f_norm) or {"lat": 28.5560, "lon": 77.0845}

        if not path:
            # Fallback: direct route with real estimation
            dist = 250
            if target_coords and start_coords:
                dist = self._haversine(start_coords['lat'], start_coords['lon'], target_coords['lat'], target_coords['lon'])
            
            path = [{
                "zone": t_norm,
                "instruction": f"Follow airport signage towards {to_zone}",
                "distance": round(dist),
                "landmark": "Check overhead direction boards",
                "icon": "🧭"
            }]

        total_dist = sum(n.get("distance", 0) for n in path)
        total_min = max(1, round(total_dist / 80))

        steps = []
        route_geometry = [[start_coords['lat'], start_coords['lon']]]
        
        for i, node in enumerate(path):
            d = node.get("distance", 50)
            walk_min = max(1, round(d / 80))
            node_coords = self._get_location_coords(node["zone"])
            
            step_data = {
                "step_number": i + 1,
                "instruction": node.get("instruction", f"Proceed to {node['zone']}"),
                "distance": f"{d}m",
                "duration": f"{walk_min} min",
                "landmark": node.get("landmark", ""),
                "icon": node.get("icon", "🚶"),
            }
            
            if node_coords:
                step_data["coords"] = [node_coords['lat'], node_coords['lon']]
                route_geometry.append(step_data["coords"])
            
            steps.append(step_data)

        return {
            "from": from_zone,
            "to": to_zone,
            "total_distance": f"{total_dist}m",
            "total_duration": f"{total_min} min",
            "steps": steps,
            "route_geometry": route_geometry,
            "source": "synthetic_indoor_map",
        }

    def get_readable_location(self, lat: float, lon: float) -> str:
        """Convert coordinates to human-readable location name."""
        zones = [
            {"name": "Terminal 3, Main Entrance & Check-in Hall", "lat": 28.5555, "lon": 77.0830, "r": 0.001},
            {"name": "Terminal 3, Security Checkpoint", "lat": 28.5560, "lon": 77.0845, "r": 0.001},
            {"name": "Terminal Area", "lat": 28.5562, "lon": 77.0844, "r": 0.001},
            {"name": "Terminal 3, Departures Lounge (Gates 1-10)", "lat": 28.5570, "lon": 77.0860, "r": 0.001},
            {"name": "Terminal 3, Food Court Area", "lat": 28.5565, "lon": 77.0850, "r": 0.001},
            {"name": "Terminal 3, Duty Free Shopping Zone", "lat": 28.5530, "lon": 77.0840, "r": 0.001},
            {"name": "Terminal 3, Gates 37-45 Corridor", "lat": 28.5525, "lon": 77.0875, "r": 0.001},
            {"name": "Terminal 3, Gates 55-62 Corridor", "lat": 28.5495, "lon": 77.0895, "r": 0.002},
            {"name": "Terminal 3, International Departures", "lat": 28.5520, "lon": 77.0840, "r": 0.002},
        ]
        best = None
        best_dist = float("inf")
        for z in zones:
            d = math.sqrt((lat - z["lat"]) ** 2 + (lon - z["lon"]) ** 2)
            if d < z["r"] and d < best_dist:
                best = z["name"]
                best_dist = d
        return best or f"Inside Airport (Near {lat:.4f}, {lon:.4f})"

    def get_time_to_gate(self, current_lat: float, current_lon: float, gate: str) -> Dict:
        """Calculate estimated time to reach a specific gate."""
        # Map gate numbers to approximate coordinates
        gate_coords = self._get_location_coords(gate)
        if not gate_coords:
            return {"gate": gate, "estimated_minutes": 8, "distance_m": 450, "status": "estimated"}

        dist_m = self._haversine(current_lat, current_lon, gate_coords["lat"], gate_coords["lon"])
        walk_min = max(1, round(dist_m / 80))

        if walk_min <= 5:
            status = "nearby"
            message = "You're very close! No rush."
        elif walk_min <= 10:
            status = "comfortable"
            message = "Plenty of time. Walk at normal pace."
        elif walk_min <= 15:
            status = "moderate"
            message = "Start heading to your gate soon."
        else:
            status = "urgent"
            message = "Please proceed to your gate now!"

        return {
            "gate": gate,
            "estimated_minutes": walk_min,
            "distance_m": round(dist_m),
            "status": status,
            "message": message,
        }

    # ── Internal helpers ──────────────────────────────────

    def _build_airport_graph(self) -> Dict:
        return {
            "Terminal Area": [
                {"zone": "Security Checkpoint", "distance": 40, "instruction": "Proceed to the security screening area", "landmark": "Signs for T3 Security", "icon": "🔒"},
            ],
            "Main Entrance": [
                {"zone": "Check-in Counters", "distance": 80, "instruction": "Walk straight towards check-in counters", "landmark": "Look for airline logos overhead", "icon": "➡️"},
            ],
            "Check-in Counters": [
                {"zone": "Security Checkpoint", "distance": 120, "instruction": "After check-in, follow 'Security' signs to checkpoint", "landmark": "Baggage wrapping station on your right", "icon": "🔒"},
            ],
            "Security Checkpoint": [
                {"zone": "Departures Lounge", "distance": 60, "instruction": "After screening, enter departures lounge", "landmark": "Duty-Free shops ahead", "icon": "✅"},
            ],
            "Departures Lounge": [
                {"zone": "Gates 1-10", "distance": 100, "instruction": "Turn left towards Gates 1-10", "landmark": "Chaayos cafe on your right", "icon": "⬅️"},
                {"zone": "Starbucks Coffee", "distance": 45, "instruction": "Starbucks is just past the security exit", "landmark": "Smell of fresh coffee on your left", "icon": "☕"},
                {"zone": "Duty Free Shop", "distance": 30, "instruction": "Enter the main Duty Free area straight ahead", "landmark": "Large perfume displays", "icon": "🛍️"},
                {"zone": "WHSmith", "distance": 55, "instruction": "WHSmith is located near the central lounge entrance", "landmark": "Magazine racks visible from distance", "icon": "📚"},
                {"zone": "Food Court", "distance": 120, "instruction": "Walk towards the central food court area", "landmark": "Vibrant food stalls ahead", "icon": "🍽️"},
            ],
            "Food Court": [
                {"zone": "Punjab Grill", "distance": 25, "instruction": "Punjab Grill is in the North corner of the food court", "landmark": "Traditional Indian decor", "icon": "🍛"},
                {"zone": "Gates 37-45", "distance": 80, "instruction": "Exit food court towards Gates 37-45", "landmark": "Follow signs for Concourse B", "icon": "➡️"},
            ],
            "Gates 1-10": [
                {"zone": "Gate 5B", "distance": 80, "instruction": "Walk along the corridor to Gate 5B", "landmark": "Restrooms on your right before the gate", "icon": "🎯"},
            ],
            "Gates 37-45": [
                {"zone": "Gate 42", "distance": 60, "instruction": "Walk to Gate 42", "landmark": "Vaango! restaurant on left", "icon": "🎯"},
            ],
            "Starbucks Coffee": [], "Punjab Grill": [], "WHSmith": [], "Duty Free Shop": [],
            "Gate 5B": [], "Gate 15": [], "Gate 42": [], "Gate 55": [],
            "Gate 60": [], "Gate 62": [], "International Departures": [],
        }

    def _bfs_path(self, start: str, end: str) -> Optional[List[Dict]]:
        if start not in self.graph or end not in self.graph:
            return None

        queue = deque([(start, [])])
        visited = {start}
        while queue:
            current, path = queue.popleft()
            if current == end:
                return path
            
            for conn in self.graph.get(current, []):
                z = conn["zone"]
                if z not in visited:
                    visited.add(z)
                    queue.append((z, path + [conn]))
        return None

    def _normalize_zone(self, name: str) -> str:
        """Try to match user-provided name to a graph node."""
        if not name: return "Terminal Area"
        name_lower = name.lower().strip()
        
        # Exact match
        for node in self.graph:
            if node.lower() == name_lower:
                return node
        
        # Substring match (avoid empty string matching everything)
        if name_lower:
            for node in self.graph:
                if name_lower in node.lower() or node.lower() in name_lower:
                    return node
        
        return "Terminal Area"

    def _get_location_coords(self, name: str) -> Optional[Dict]:
        loc_map = {
            "Terminal Area": {"lat": 28.5562, "lon": 77.0844},
            "5B": {"lat": 28.5570, "lon": 77.0860},
            "15": {"lat": 28.5558, "lon": 77.0815},
            "42": {"lat": 28.5566, "lon": 77.0848},
            "55": {"lat": 28.5497, "lon": 77.0891},
            "60": {"lat": 28.5495, "lon": 77.0900},
            "62": {"lat": 28.5491, "lon": 77.0903},
            "Starbucks Coffee": {"lat": 28.5565, "lon": 77.0855},
            "Cafeccino": {"lat": 19.0917053, "lon": 72.8567979},
            "Irani Cafe": {"lat": 19.0964751, "lon": 72.8744612},
            "Punjab Grill": {"lat": 28.5568, "lon": 77.0850},
            "WHSmith": {"lat": 28.5563, "lon": 77.0842},
            "Duty Free Shop": {"lat": 28.5561, "lon": 77.0852},
            "Costa Coffee": {"lat": 28.5596708, "lon": 77.0873733},
            "Security Checkpoint": {"lat": 28.5560, "lon": 77.0845},
            "Departures Lounge": {"lat": 28.5564, "lon": 77.0848},
            "Food Court": {"lat": 28.5567, "lon": 77.0851},
            "Premium Lounge": {"lat": 28.5569, "lon": 77.0858},
            "Pharmacy": {"lat": 28.5555, "lon": 77.0835},
            "ATM (HDFC)": {"lat": 28.5558, "lon": 77.0838},
        }
        n = self._normalize_zone(name)
        return loc_map.get(n)


    def _haversine(self, lat1, lon1, lat2, lon2):
        R = 6371000
        p1, p2 = math.radians(lat1), math.radians(lat2)
        dp = math.radians(lat2 - lat1)
        dl = math.radians(lon2 - lon1)
        a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    def _load_poi_data(self):
        return {}  # Loaded from airport_knowledge.json if needed


# Global instance
navigation_service = IndoorNavigationService()
