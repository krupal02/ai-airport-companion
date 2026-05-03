import speech_recognition as sr

class STT:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.pause_threshold = 0.8

    def listen(self):
        with sr.Microphone() as source:
            print("Adjusting for ambient noise...")
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            print("Listening...")
            try:
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                print("Recognizing...")
                # Crucial to use hi-IN to transcribe Hindi/Hinglish perfectly
                text = self.recognizer.recognize_google(audio, language='hi-IN')
                return text
            except sr.WaitTimeoutError:
                return "Listening timed out."
            except sr.UnknownValueError:
                return "Could not understand audio."
            except sr.RequestError as e:
                return f"Could not request results; {e}"

# For testing
if __name__ == "__main__":
    stt = STT()
    print(stt.listen())
