import threading
try:
    import pythoncom
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False

class ContinuousVoiceReader:
    """Enhanced TTS with continuous reading that auto-stops on new user message."""

    def __init__(self):
        self.is_reading = False
        self.stop_flag = threading.Event()
        self.current_thread = None

    def read_document(self, text, language="en"):
        """Read text continuously in background. Stops if stop_reading() is called."""
        if not HAS_WIN32:
            print(f"[TTS Mock Continuous] {text}")
            return
            
        self.stop_reading()
        self.stop_flag.clear()
        self.is_reading = True

        chunks = self._split_chunks(text)

        def _read():
            pythoncom.CoInitialize()
            try:
                import win32com.client
                speaker = win32com.client.Dispatch("SAPI.SpVoice")
                speaker.Rate = 1
                speaker.Volume = 100

                # Try to pick a clear voice
                try:
                    for v in speaker.GetVoices():
                        desc = v.GetDescription()
                        if "Zira" in desc or "David" in desc:
                            speaker.Voice = v
                            break
                except Exception:
                    pass

                for chunk in chunks:
                    if self.stop_flag.is_set():
                        break
                    speaker.Speak(chunk, 1)  # async speak
                    # Wait until chunk finishes or stop is requested
                    while speaker.Status.RunningState == 2:
                        if self.stop_flag.is_set():
                            speaker.Speak("", 3)  # purge
                            break
                        self.stop_flag.wait(0.1)
                    if self.stop_flag.is_set():
                        break
                    # Small pause between chunks
                    self.stop_flag.wait(0.4)
            except Exception as e:
                print(f"Voice reading error: {e}")
            finally:
                self.is_reading = False
                pythoncom.CoUninitialize()

        self.current_thread = threading.Thread(target=_read, daemon=True)
        self.current_thread.start()

    def stop_reading(self):
        """Stop any active reading immediately."""
        if self.is_reading:
            self.stop_flag.set()
            if self.current_thread:
                self.current_thread.join(timeout=2)
            self.is_reading = False

    def get_status(self):
        return {"is_reading": self.is_reading, "can_interrupt": True}

    def _split_chunks(self, text, max_size=400):
        import re
        paragraphs = text.split('\n\n')
        chunks = []
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if len(para) <= max_size:
                chunks.append(para)
            else:
                sentences = re.split(r'(?<=[.!?])\s+', para)
                buf = ""
                for s in sentences:
                    if len(buf) + len(s) <= max_size:
                        buf += s + " "
                    else:
                        if buf:
                            chunks.append(buf.strip())
                        buf = s + " "
                if buf:
                    chunks.append(buf.strip())
        return chunks if chunks else [text]


# Global instance
voice_reader = ContinuousVoiceReader()
