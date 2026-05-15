import requests
from Backend.RAGService import RAGService

class ChatBot:
    def __init__(self):
        self.rag_service = RAGService()
        self.model_name = "qwen2.5:0.5b"
        print(f"ChatBot initialized to use local Ollama model: {self.model_name}")

    def _build_system_prompt(self, user_profile: str, location_context: str, context: str) -> str:
        """Build a context-aware system prompt based on user profile data."""
        
        base = (
            "You are AeroGuide, an AI Airport Companion at the Airport. "
            "You are helpful, polite, and concise. "
            "ALWAYS use the Context Information below to answer. Quote specific details like gate numbers, "
            "restaurant names, prices, security steps, shop items, and SKUs from the context. "
            "If the context contains the answer, use it. If not, say you don't have that information. "
            "CRITICAL: NEVER show raw latitude/longitude coordinates to the user. Instead, use landmarks, terminal zones, or simple place names. Calculate distances internally. "
            "Always provide exact time estimates and walking distances when discussing locations (Assume 80 meters/min walking speed). "
            "CRITICAL: If the user asks about food, cafes, or restaurants, YOU MUST explicitly tell them: 'You can use the Budget-Aware Food Finder below to set your exact budget and dietary preferences!' "
            "CRITICAL: If the user asks about security line wait times or their PNR, tell them the live security wait time provided in the Passenger Location context below."
        )

        # Parse profile string for personalization
        profile_lower = user_profile.lower()

        # Travel frequency adaptation
        if 'first_time' in profile_lower or 'first-time' in profile_lower:
            base += (
                "\n\nThe user is a FIRST-TIME FLYER. Provide:"
                "\n- Detailed step-by-step instructions"
                "\n- Explanations of airport terminology (gates, boarding pass, etc.)"
                "\n- Extra reassurance and encouragement"
                "\n- Proactive warnings about common mistakes"
                "\n- Suggest arriving extra early"
            )
        elif 'frequent' in profile_lower:
            base += (
                "\n\nThe user is a FREQUENT FLYER. Provide:"
                "\n- Concise, direct information without over-explaining basics"
                "\n- Shortcuts and time-saving tips"
                "\n- Lounge access information when relevant"
                "\n- Priority lane suggestions"
                "\n- Assume familiarity with airport procedures"
            )
        elif 'occasional' in profile_lower:
            base += (
                "\n\nThe user is an OCCASIONAL TRAVELER. Provide:"
                "\n- Clear information with moderate detail"
                "\n- Gentle reminders of important steps"
                "\n- Highlight any changes since last travel season"
            )

        # Age-based adaptation
        if '65+' in profile_lower or 'senior' in profile_lower:
            base += (
                "\n\nThe user is a SENIOR CITIZEN. Provide:"
                "\n- Slower-paced, patient guidance"
                "\n- Information about wheelchair and buggy services"
                "\n- Rest area locations nearby"
                "\n- Add extra time buffers in all walking estimates"
            )

        # Dietary awareness
        if 'diet:' in profile_lower or 'dietary' in profile_lower or 'veg' in profile_lower:
            if 'veg' in profile_lower and 'non' not in profile_lower:
                base += "\n\nThe user is VEGETARIAN. Only recommend vegetarian food options."
            elif 'vegan' in profile_lower:
                base += "\n\nThe user is VEGAN. Only recommend vegan food options."
            elif 'jain' in profile_lower:
                base += "\n\nThe user is JAIN. Only recommend Jain-friendly food (no root vegetables, onion, garlic)."

        # Special assistance
        if 'wheelchair' in profile_lower:
            base += "\n\nThe user needs WHEELCHAIR ASSISTANCE. Prioritize accessible routes and elevator locations."
        if 'visual' in profile_lower:
            base += "\n\nThe user has VISUAL IMPAIRMENT. Provide detailed verbal directions with landmarks."
        if 'infant' in profile_lower:
            base += "\n\nThe user is TRAVELING WITH AN INFANT. Mention baby care rooms, family lanes, and stroller policies."

        # Inject context
        base += f"\n\nUser Profile/Status: {user_profile}"
        base += f"\n\nPassenger Location: {location_context}"
        base += f"\n\n--- Context Information ---\n{context}\n--- End Context ---"

        return base

    def get_response(self, query: str, user_profile: str, latitude: float = None, longitude: float = None) -> str:
        # Check if Hindi is requested
        is_hindi = 'language: hindi' in user_profile.lower()
        
        # If Hindi, translate the query to English first so the AI understands it perfectly
        final_query = query
        try:
            if is_hindi:
                from deep_translator import GoogleTranslator
                final_query = GoogleTranslator(source='hi', target='en').translate(query)
        except Exception as e:
            print(f"Translation to English failed: {e}")

        # Retrieve relevant context from RAG using the English query
        try:
            context = self.rag_service.retrieve_context(final_query)
        except Exception as e:
            print(f"RAG error: {e}")
            context = ""
        
        import random
        # Location Mapping
        location_context = "Terminal 2, Near Check-in Area"
        if latitude and longitude:
            location_context = f"Coordinates: ({latitude}, {longitude}) - Terminal 2 Area"

        # Mock live security wait time for the presentation
        live_wait = random.randint(4, 12)
        location_context += f"\nLIVE SECURITY WAIT TIME FOR CURRENT PNR: {live_wait} minutes."

        system_prompt = self._build_system_prompt(user_profile, location_context, context)
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": final_query}
        ]
        
        try:
            payload = {
                "model": self.model_name,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 512
                }
            }
            
            response = requests.post("http://localhost:11434/api/chat", json=payload, timeout=60)
            response.raise_for_status()
            
            data = response.json()
            english_response = data["message"]["content"].strip()

            # Translate the AI's English response back to Hindi
            if is_hindi:
                try:
                    from deep_translator import GoogleTranslator
                    hindi_response = GoogleTranslator(source='en', target='hi').translate(english_response)
                    return hindi_response
                except Exception as e:
                    print(f"Translation to Hindi failed: {e}")
                    return english_response

            return english_response
            
        except requests.exceptions.ConnectionError:
            mock = f"[Cloud Demo Mode] Here is a simulated response for: '{final_query}'. The live model requires local Ollama hardware."
            return mock if not is_hindi else f"[Cloud Demo Mode] {mock}"
        except requests.exceptions.Timeout:
            return "The AI is taking longer than expected. Please try your question again." if not is_hindi else "AI को अपेक्षा से अधिक समय लग रहा है। कृपया अपना प्रश्न पुनः पूछें।"
        except Exception as e:
            return f"I encountered an error: {str(e)}. Please try again." if not is_hindi else "मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।"

# For testing
if __name__ == "__main__":
    bot = ChatBot()
    print(bot.get_response("Where is Starbucks?", "Name: Raj, Travel Type: first_time, Age Group: 18-30, Diet: veg"))
