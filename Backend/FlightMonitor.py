import asyncio
import random
from datetime import datetime
from typing import Dict, List

class FlightChangeMonitor:
    """Monitors flights and generates real-time gate/terminal/status change alerts."""

    def __init__(self):
        self.registered_flights: Dict[str, Dict] = {}  # user_id -> flight_data
        self.pending_notifications: Dict[str, List] = {}  # user_id -> [notifications]
        self._demo_triggered = False

    def register_flight(self, user_id: str, flight_data: Dict):
        """Register a user's flight for monitoring."""
        self.registered_flights[user_id] = {
            **flight_data,
            "registered_at": datetime.now().isoformat(),
        }
        self.pending_notifications.setdefault(user_id, [])

    def trigger_demo_change(self, user_id: str, change_type: str = "gate"):
        """
        Manually trigger a flight change for demo purposes.
        This is used during the presentation to show the alert system.
        """
        flight = self.registered_flights.get(user_id)
        if not flight:
            # Auto-register for hackathon demo purposes
            self.register_flight(user_id, {
                "flight_number": "AI 505",
                "gate": "5B",
                "terminal": "T3",
                "boarding_time": "14:30"
            })
            flight = self.registered_flights[user_id]

        notification = {
            "type": "flight_change",
            "timestamp": datetime.now().isoformat(),
            "flight_number": flight.get("flight_number", "AI 505"),
            "severity": "high",
            "changes": {},
            "action_required": "",
        }

        if change_type == "gate":
            old_gate = flight.get("gate", "5B")
            new_gate = random.choice(["7A", "12B", "3C", "9A", "14B"])
            while new_gate == old_gate:
                new_gate = random.choice(["7A", "12B", "3C", "9A", "14B"])
            notification["changes"]["gate"] = {"old": old_gate, "new": new_gate}
            notification["action_required"] = f"Gate changed to {new_gate}. Please head there now."
            notification["severity"] = "high"
            # Update stored data
            self.registered_flights[user_id]["gate"] = new_gate

        elif change_type == "terminal":
            old_terminal = flight.get("terminal", "T3")
            new_terminal = "T1" if old_terminal == "T3" else "T3"
            notification["changes"]["terminal"] = {"old": old_terminal, "new": new_terminal}
            notification["action_required"] = f"URGENT: Terminal changed to {new_terminal}! Proceed immediately."
            notification["severity"] = "critical"
            self.registered_flights[user_id]["terminal"] = new_terminal

        elif change_type == "delay":
            notification["changes"]["status"] = {"old": "On Time", "new": "Delayed by 45 min"}
            notification["action_required"] = "Flight delayed. New boarding time will be announced."
            notification["severity"] = "medium"

        elif change_type == "boarding":
            notification["changes"]["status"] = {"old": "On Time", "new": "Now Boarding"}
            notification["action_required"] = "Boarding has started! Proceed to gate immediately."
            notification["severity"] = "critical"

        self.pending_notifications.setdefault(user_id, []).append(notification)
        return notification

    def get_notifications(self, user_id: str) -> List[Dict]:
        """Get and clear pending notifications for a user."""
        notifs = self.pending_notifications.get(user_id, [])
        self.pending_notifications[user_id] = []
        return notifs

    def get_flight_status(self, user_id: str) -> Dict:
        """Get current flight status."""
        flight = self.registered_flights.get(user_id)
        if not flight:
            return {"error": "No flight registered"}
        return flight


# Global instance
flight_monitor = FlightChangeMonitor()
