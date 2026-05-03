import { useState, useCallback, useRef } from 'react';
import { initialMessages } from '../utils/mockData';

let messageIdCounter = initialMessages.length + 1;

function getTimeString() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function useChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const scrollRef = useRef(null);

  const sendMessage = useCallback(async (text, userMode = 'first-time', coordinates = null, userProfile = null) => {
    if (!text.trim()) return;

    const userMsg = {
      id: messageIdCounter++,
      type: 'user',
      content: text.trim(),
      timestamp: getTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          user_profile: userMode,
          user_id: userProfile?.user_id || null,
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null
        })
      });

      const data = await res.json();
      
      // Determine if navigation should be shown based on user intent
      const q = text.toLowerCase();
      const needsNav = q.includes('where') || q.includes('navigate') || q.includes('how to get to') || q.includes('directions');
      let dest = 'Gate 5B';
      if (q.includes('gate')) {
        const match = q.match(/gate\s*(\w+)/i);
        if (match) dest = `Gate ${match[1].toUpperCase()}`;
      } else if (q.includes('terminal')) {
        const match = q.match(/terminal\s*(\w+)/i);
        if (match) dest = `Terminal ${match[1].toUpperCase()}`;
      } else if (q.includes('transfer')) {
         dest = 'Terminal Transfer Point';
      }

      const assistantMsg = {
        id: messageIdCounter++,
        type: 'assistant',
        content: data.response,
        timestamp: getTimeString(),
        hasNavigation: needsNav,
        navigationTo: dest,
        hasPlaces: false,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      // Fallback message
      setMessages(prev => [...prev, {
        id: messageIdCounter++,
        type: 'system',
        content: "Network error connecting to AI backend.",
        timestamp: getTimeString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const giveFeedback = useCallback((messageId, isPositive) => {
    setFeedbackGiven(prev => ({ ...prev, [messageId]: isPositive ? 'positive' : 'negative' }));
  }, []);

  return {
    messages,
    isTyping,
    feedbackGiven,
    sendMessage,
    giveFeedback,
    scrollRef,
  };
}
