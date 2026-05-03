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
        path = self._bfs_path(from_zone, to_zone)
        if not path:
            # Fallback: direct route
            path = [{
                "zone": to_zone,
                "instruction": f"Follow airport signage towards {to_zone}",
                "distance": 250,
                "landmark": "Check overhead direction boards",
                "icon": "🧭"
            }]

        total_dist = sum(n["distance"] for n in path)
        total_min = max(1, round(total_dist / 80))  # 80m per minute walking

        steps = []
        for i, node in enumerate(path):
            walk_min = max(1, round(node["distance"] / 80))
            steps.append({
                "step_number": i + 1,
                "instruction": node["instruction"],
                "distance": f"{node['distance']}m",
                "duration": f"{walk_min} min",
                "landmark": node.get("landmark", ""),
                "icon": node.get("icon", "🚶"),
            })

        return {
            "from": from_zone,
            "to": to_zone,
            "total_distance": f"{total_dist}m",
            "total_duration": f"{total_min} min",
            "steps": steps,
            "source": "synthetic_indoor_map",
        }

    def get_readable_location(self, lat: float, lon: float) -> str:
        """Convert coordinates to human-readable location name."""
        zones = [
            {"name": "Terminal 3, Main Entrance & Check-in Hall", "lat": 28.5555, "lon": 77.0830, "r": 0.001},
            {"name": "Terminal 3, Security Checkpoint", "lat": 28.5560, "lon": 77.0845, "r": 0.001},
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
        gate_coords = self._get_gate_coords(gate)
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
                {"zone": "Gates 11-20", "distance": 150, "instruction": "Walk straight towards Gates 11-20", "landmark": "Costa Coffee on your left", "icon": "➡️"},
                {"zone": "Gates 37-45", "distance": 200, "instruction": "Continue straight past the food court towards Gates 37-45", "landmark": "Wow! Momo counter on right", "icon": "➡️"},
                {"zone": "Duty Free Zone", "distance": 80, "instruction": "Turn right into the Duty Free shopping area", "landmark": "Perfume section entrance", "icon": "🛍️"},
            ],
            "Gates 1-10": [
                {"zone": "Gate 5B", "distance": 80, "instruction": "Walk along the corridor to Gate 5B", "landmark": "Restrooms on your right before the gate", "icon": "🎯"},
            ],
            "Gates 11-20": [
                {"zone": "Gate 15", "distance": 70, "instruction": "Continue to Gate 15", "landmark": "Dosa Factory restaurant nearby", "icon": "🎯"},
            ],
            "Gates 37-45": [
                {"zone": "Gate 42", "distance": 60, "instruction": "Walk to Gate 42", "landmark": "Vaango! restaurant on left", "icon": "🎯"},
                {"zone": "Gates 55-62", "distance": 180, "instruction": "Continue further towards Gates 55-62", "landmark": "Follow overhead signs", "icon": "➡️"},
            ],
            "Gates 55-62": [
                {"zone": "Gate 55", "distance": 50, "instruction": "Gate 55 is on your left", "landmark": "Near the end of the concourse", "icon": "🎯"},
                {"zone": "Gate 60", "distance": 80, "instruction": "Continue to Gate 60", "landmark": "Window seating area on right", "icon": "🎯"},
                {"zone": "Gate 62", "distance": 100, "instruction": "Walk to the end for Gate 62", "landmark": "Last gate in this wing", "icon": "🎯"},
            ],
            "Duty Free Zone": [
                {"zone": "International Departures", "distance": 100, "instruction": "Continue through duty free to International departures", "landmark": "Swarovski store on left", "icon": "✈️"},
            ],
            # Terminal nodes
            "Gate 5B": [], "Gate 15": [], "Gate 42": [], "Gate 55": [],
            "Gate 60": [], "Gate 62": [], "International Departures": [],
        }

    def _bfs_path(self, start: str, end: str) -> Optional[List[Dict]]:
        # Normalize zone name
        start = self._normalize_zone(start)
        end = self._normalize_zone(end)

        if start not in self.graph or end not in self.graph:
            return None

        queue = deque([(start, [])])
        visited = set()
        while queue:
            current, path = queue.popleft()
            if current == end:
                return path
            if current in visited:
                continue
            visited.add(current)
            for conn in self.graph.get(current, []):
                queue.append((conn["zone"], path + [conn]))
        return None

    def _normalize_zone(self, name: str) -> str:
        """Try to match user-provided name to a graph node."""
        name_lower = name.lower().strip()
        for node in self.graph:
            if node.lower() == name_lower:
                return node
        # Partial match
        for node in self.graph:
            if name_lower in node.lower() or node.lower() in name_lower:
                return node
        return name

    def _get_gate_coords(self, gate: str) -> Optional[Dict]:
        gate_map = {
            "5B": {"lat": 28.5570, "lon": 77.0860},
            "5b": {"lat": 28.5570, "lon": 77.0860},
            "15": {"lat": 28.5558, "lon": 77.0815},
            "42": {"lat": 28.5566, "lon": 77.0848},
            "55": {"lat": 28.5497, "lon": 77.0891},
            "60": {"lat": 28.5495, "lon": 77.0900},
            "62": {"lat": 28.5491, "lon": 77.0903},
        }
        g = gate.upper().replace("GATE ", "").replace("GATE", "").strip()
        return gate_map.get(g) or gate_map.get(g.lower())

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
