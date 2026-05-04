import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { useApp } from '../../context/AppContext';
import { suggestedPrompts } from '../../utils/mockData';
import { useVoice } from '../../hooks/useVoice';
import RouteDisplay from '../Navigation/RouteDisplay';

function parseContent(text) {
  // Simple markdown-like parsing for bold
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={j}>{p.slice(2, -2)}</strong>;
      }
      return p;
    });
    return <span key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</span>;
  });
}

function MessageBubble({ msg, feedbackGiven, onFeedback, isFirstTime, startReading }) {
  const [showNav, setShowNav] = useState(false);

  if (msg.type === 'system') {
    return (
      <div className="message system" role="alert">
        <div className="msg-bubble">{msg.content}</div>
      </div>
    );
  }

  const isUser = msg.type === 'user';

  return (
    <div className={`message ${msg.type}`}>
      {!isUser && <div className="msg-avatar">AC</div>}
      <div className="msg-bubble">
        <div className="msg-content">{parseContent(msg.content)}</div>
        {msg.steps && (
          <div className="msg-steps">
            {msg.steps.map((step, i) => (
              <div className="msg-step" key={i}>
                <div className="step-num">{i + 1}</div>
                <div className="step-text">{parseContent(step)}</div>
              </div>
            ))}
          </div>
        )}
        {msg.hasNavigation && (
          <div style={{ marginTop: '12px' }}>
            {!showNav ? (
              <button 
                className="msg-nav-btn" 
                style={{ width: '100%', background: 'var(--primary)', color: '#fff' }} 
                aria-label="Start navigation" 
                onClick={() => setShowNav(true)}
              >
                🗺️ Show Directions to {msg.navigationTo || 'Destination'}
              </button>
            ) : (
              <div style={{ marginTop: '8px', textAlign: 'left' }}>
                <button 
                  style={{ fontSize: '0.75rem', color: 'var(--text-sec)', marginBottom: '8px', cursor: 'pointer' }} 
                  onClick={() => setShowNav(false)}
                >
                  Close Navigation
                </button>
                <RouteDisplay from="Terminal 3, Main Entrance" to={msg.navigationTo || 'Gate 5B'} />
              </div>
            )}
          </div>
        )}
        {msg.hasPlaces && msg.places && (
          <div className="msg-places">
            {msg.places.map((p, i) => (
              <div className="msg-place" key={i}>
                <div style={{ flex: 1 }}>
                  <div className="msg-place-name">{p.name}</div>
                  <div className="msg-place-meta">{p.category} · {p.distance} · ⭐ {p.rating}</div>
                </div>
                <button className="nearby-nav-btn">Navigate</button>
              </div>
            ))}
          </div>
        )}
        {!isUser && (
          <div className="msg-feedback">
            <span>Helpful?</span>
            <button
              className={`feedback-btn ${feedbackGiven === 'positive' ? 'positive' : ''}`}
              onClick={() => onFeedback(msg.id, true)}
              aria-label="Helpful"
              disabled={!!feedbackGiven}
            >👍</button>
            <button
              className={`feedback-btn ${feedbackGiven === 'negative' ? 'negative' : ''}`}
              onClick={() => onFeedback(msg.id, false)}
              aria-label="Not helpful"
              disabled={!!feedbackGiven}
            >👎</button>
            {feedbackGiven && <span style={{ fontSize: '.75rem', color: '#52C41A' }}>Thanks!</span>}
            <button className="read-aloud-btn ml-2 bg-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-700 transition" onClick={() => startReading(msg.content)}>
              🔊 Read Aloud
            </button>
          </div>
        )}
      </div>
      <div className="msg-time">{msg.timestamp}</div>
    </div>
  );
}

export default function ChatInterface() {
  const { flight, userMode, coordinates, userProfile, language, showNavigation, setShowNavigation, navDestination } = useApp();
  const { messages, isTyping, feedbackGiven, sendMessage, giveFeedback } = useChat();
  const { isReading, stopReading, startReading } = useVoice();
  const [input, setInput] = useState('');
  const [micActive, setMicActive] = useState(false);
  const messagesEndRef = useRef(null);
  const isFirstTime = userMode === 'first-time';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (isReading) stopReading();
    sendMessage(input, userMode, coordinates, userProfile, language);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePrompt = (text) => {
    sendMessage(text, userMode, coordinates, userProfile, language);
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Changed to English to improve transcription accuracy

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setMicActive(false);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setMicActive(false);
      };

      rec.onend = () => {
        setMicActive(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    if (micActive) {
      recognitionRef.current.stop();
      setMicActive(false);
    } else {
      recognitionRef.current.start();
      setMicActive(true);
    }
  };

  return (
    <main className="chat-panel" role="main" aria-label="Chat interface">
      {/* Context Bar */}
      <div className="chat-context-bar">
        <div className="info">✈️ {flight.flightNumber}</div>
        <span className="separator">|</span>
        <div className="info">🚪 Gate {flight.gate}</div>
        <span className="separator">|</span>
        <div className="info">🕐 Departs {flight.departureTime}</div>
        <span className="separator">|</span>
        <div className="info" style={{ color: '#52C41A' }}>✓ {flight.status}</div>
      </div>

      {/* Messages */}
      <div className="messages-area" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            feedbackGiven={feedbackGiven[msg.id]}
            onFeedback={giveFeedback}
            isFirstTime={isFirstTime}
            startReading={startReading}
          />
        ))}
        {isTyping && (
          <div className="typing-indicator" aria-label="Assistant is typing">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="suggested-prompts" role="list" aria-label="Suggested questions">
        {suggestedPrompts.map(p => (
          <button
            key={p.id}
            className="prompt-chip"
            onClick={() => handlePrompt(p.text)}
            role="listitem"
          >
            {p.icon} {p.text}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        {isReading && (
          <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg mb-2 text-sm text-blue-300">
            <div className="flex gap-1">
              <span className="w-1 h-3 bg-blue-400 animate-pulse"></span>
              <span className="w-1 h-3 bg-blue-400 animate-pulse" style={{animationDelay: '150ms'}}></span>
              <span className="w-1 h-3 bg-blue-400 animate-pulse" style={{animationDelay: '300ms'}}></span>
            </div>
            AI is reading...
            <button onClick={stopReading} className="ml-auto text-red-400 hover:text-red-300">⏸️ Pause</button>
          </div>
        )}
        <div className="chat-input-wrap">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isReading ? "Type to stop reading..." : (isFirstTime ? "Ask me anything about the airport..." : "Ask away...")}
            aria-label="Type your message"
            id="chat-input"
          />
          <button
            className={`input-btn mic ${micActive ? 'active' : ''}`}
            onClick={toggleMic}
            aria-label={micActive ? 'Stop listening' : 'Start voice input'}
          >
            🎙️
          </button>
          <button
            className="input-btn send"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
      {/* Global Navigation Overlay (Triggered from Sidebar) */}
      {showNavigation && navDestination && (
        <div className="nav-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          zIndex: 1000,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#fff' }}>🗺️ Navigation to {navDestination}</h3>
            <button 
              onClick={() => setShowNavigation(false)}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Close Map
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', borderRadius: '12px', background: '#1e293b' }}>
            <RouteDisplay from="Terminal Area" to={navDestination} />
          </div>
        </div>
      )}
    </main>
  );
}
