import { useState, useEffect, useCallback } from 'react';

export const useVoice = () => {
  const [isReading, setIsReading] = useState(false);
  
  useEffect(() => {
    const checkStatus = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/voice/status');
        const data = await response.json();
        setIsReading(data.is_reading);
      } catch {
        // ignore
      }
    }, 1000);
    return () => clearInterval(checkStatus);
  }, []);
  
  const stopReading = useCallback(async () => {
    try {
      await fetch('http://localhost:8000/api/voice/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: localStorage.getItem('aeroguide_user_id') || 'local' })
      });
      setIsReading(false);
    } catch (error) {
      console.error('Failed to stop reading:', error);
    }
  }, []);

  const startReading = useCallback(async (text, language = 'en') => {
    try {
      await fetch('http://localhost:8000/api/voice/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: localStorage.getItem('aeroguide_user_id') || 'local',
          text,
          language
        })
      });
      setIsReading(true);
    } catch (error) {
      console.error('Failed to start reading:', error);
    }
  }, []);
  
  return { isReading, stopReading, startReading };
};
