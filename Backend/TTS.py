import threading

try:
    import pythoncom
    import win32com.client
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False

class TTS:
    def __init__(self):
        pass

    def speak(self, text: str):
        if not HAS_WIN32:
            print(f"[TTS Mock] {text}")
            return

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
