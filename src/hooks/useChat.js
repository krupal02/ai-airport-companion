import { useState, useCallback, useRef } from 'react';
import { initialMessages, sampleResponses } from '../utils/mockData';

let messageIdCounter = initialMessages.length + 1;

function getTimeString() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function generateResponse(userMessage) {
  const lower = userMessage.toLowerCase().trim();

  // Check for matching responses
  for (const [key, response] of Object.entries(sampleResponses)) {
    if (lower.includes(key) || key.includes(lower)) {
      return response;
    }
  }

  // Gate-related
  if (lower.includes('gate')) {
    return sampleResponses['where is my gate'];
  }

  // Food-related
  if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant') || lower.includes('café') || lower.includes('coffee')) {
    return sampleResponses['food options nearby'];
  }

  // Restroom-related
  if (lower.includes('restroom') || lower.includes('bathroom') || lower.includes('toilet') || lower.includes('washroom')) {
    return sampleResponses['restroom locations'];
  }

  // Baggage
  if (lower.includes('baggage') || lower.includes('luggage') || lower.includes('bag')) {
    return {
      content: 'Here are the key baggage rules for your flight:\n\n• **Cabin Baggage:** 1 bag up to 7 kg (55×40×20 cm)\n• **Check-in Baggage:** Up to 15 kg included\n• **Excess Baggage:** ₹600 per additional kg\n• **Prohibited Items:** Liquids over 100ml, sharp objects, batteries in checked bags\n\nWould you like more details on any specific rule?',
    };
  }

  // Lounge
  if (lower.includes('lounge')) {
    return {
      content: 'There are 2 lounges available near you:\n\n🛋️ **Plaza Premium Lounge** — 150m away\n• Access: ₹1,500 or Priority Pass\n• Amenities: Buffet, showers, WiFi\n\n🛋️ **Air India Maharaja Lounge** — 300m away\n• Access: Business class or Star Alliance Gold\n• Amenities: Bar, hot meals, rest area\n\nWould you like directions to either lounge?',
    };
  }

  // Shopping / duty free
  if (lower.includes('shop') || lower.includes('duty free') || lower.includes('buy')) {
    return {
      content: 'Here are the nearby shopping options:\n\n🛍️ **Duty Free Shop** — 80m (1 min walk) — Currently **20% OFF** on perfumes!\n📚 **WHSmith** — 50m (1 min walk) — Books, magazines, travel essentials\n👜 **The Fashion Store** — 250m (4 min walk) — Brands & accessories\n\nWould you like me to navigate you to any of these?',
    };
  }

  // Default response
  return {
    content: `I'd be happy to help you with that! Here are some things I can assist you with:\n\n• 🚪 **Gate & Terminal Navigation** — Find your way around\n• 🍽️ **Food & Dining** — Discover nearby restaurants\n• 🛍️ **Shopping & Duty Free** — Find the best deals\n• 🚻 **Facilities** — Restrooms, lounges, charging\n• 🧳 **Baggage Information** — Rules & tracking\n• ✈️ **Flight Updates** — Status & gate changes\n\nJust ask me anything specific!`,
  };
}

export function useChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const scrollRef = useRef(null);

  const sendMessage = useCallback(async (text, userMode = 'first-time', coordinates = null) => {
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
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null
        })
      });
      
      const data = await res.json();
      
      const assistantMsg = {
        id: messageIdCounter++,
        type: 'assistant',
        content: data.response,
        timestamp: getTimeString(),
        hasNavigation: false,
        hasPlaces: false,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
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
