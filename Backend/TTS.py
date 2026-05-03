import pythoncom
import win32com.client
import threading

class TTS:
    def __init__(self):
        # We need to run SAPI5 in the same thread if we want it to block, 
        # or handle COM initialization per thread if we don't want it to freeze the main thread.
        # But per user instruction: "Do NOT use pyttsx3 because it freezes threads. Use this exact logic..."
        pass

    def speak(self, text: str):
        def _speak_thread():
            pythoncom.CoInitialize()
            try:
                speaker = win32com.client.Dispatch("SAPI.SpVoice")
                speaker.Speak(text)
            finally:
                pythoncom.CoUninitialize()
        
        # Run in a background thread to avoid freezing FastAPI
        threading.Thread(target=_speak_thread, daemon=True).start()

# For testing
if __name__ == "__main__":
    tts = TTS()
    tts.speak("Hello, welcome to the airport.")
    import time; time.sleep(2)
