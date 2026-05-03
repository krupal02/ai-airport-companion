import torch
from transformers import pipeline
from Backend.RAGService import RAGService

class ChatBot:
    def __init__(self):
        self.rag_service = RAGService()
        self.model_name = "Qwen/Qwen2.5-0.5B-Instruct"
        print(f"Loading {self.model_name}... This may take a minute on first run.")
        self.pipe = pipeline(
            "text-generation", 
            model=self.model_name, 
            torch_dtype=torch.float32, 
            device_map="auto"
        )

    def get_response(self, query: str, user_profile: str, latitude: float = None, longitude: float = None) -> str:
        # Retrieve relevant context from RAG
        context = self.rag_service.retrieve_context(query)
        
        # Mock Location Mapping
        location_context = "Unknown Location"
        if latitude and longitude:
            # We are mocking the indoor mapping for the hackathon
            location_context = "Terminal 2, Near Security Checkpoint (Coordinates tracking active)"

        system_prompt = (
            "You are an AI Airport Companion. You are helpful, polite, and concise. "
            "Use the provided context to answer the user's query. If you don't know the answer, say you don't know. "
            "CRITICAL RULE: No matter what language the user speaks (e.g. Hindi, Hinglish), "
            "you MUST always reply in pure, correct ENGLISH. Do not use Hindi text. "
            f"\n\nUser Profile/Status: {user_profile}"
            f"\n\nExact Passenger Location: {location_context}"
            f"\n\nContext Information:\n{context}"
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ]
        
        try:
            prompt = self.pipe.tokenizer.apply_chat_template(
                messages, 
                tokenize=False, 
                add_generation_prompt=True
            )
            
            outputs = self.pipe(
                prompt, 
                max_new_tokens=256, 
                do_sample=True, 
                temperature=0.7, 
                top_p=0.9
            )
            
            response = outputs[0]["generated_text"][len(prompt):]
            return response.strip()
        except Exception as e:
            return f"Error communicating with LLM: {str(e)}"

# For testing
if __name__ == "__main__":
    bot = ChatBot()
    print(bot.get_response("Where is starbucks?", "First Time Flyer"))
