# AI Airport Companion ✈️

A modern, accessible React frontend for navigating airports with ease. Features real-time flight info, AI chat assistance, nearby places, and step-by-step navigation.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Features

- **3-Column Layout**: Status dashboard, AI chat, and smart suggestions
- **AI Chat Interface**: Contextual responses with step-by-step navigation, place cards, and feedback
- **Flight Dashboard**: Real-time status, gate info, and time-to-gate indicator
- **Smart Suggestions**: Nearby places, offers, quick tips, and destination weather
- **Navigation Modal**: Visual route stepper with estimated times
- **User Modes**: First-time (detailed) and frequent (compact) traveler modes
- **Accessibility**: Font size scaling, high contrast mode, ARIA labels, keyboard navigation
- **Responsive Design**: Desktop (3-col), tablet (2-col), mobile (single-col with drawers)

## Architecture

```
src/
├── components/
│   ├── Header/Header.jsx          # Top bar with airport/language/mode selectors
│   ├── LeftPanel/LeftPanel.jsx     # Status, flight, time-to-gate, quick actions
│   ├── ChatInterface/ChatInterface.jsx  # Messages, input, suggested prompts
│   ├── RightPanel/RightPanel.jsx   # Nearby places, offers, tips, weather
│   ├── Navigation/NavigationModal.jsx   # Route stepper modal
│   └── Common/Dropdown.jsx        # Reusable dropdown component
├── context/
│   ├── AppContext.jsx              # Global app state (flight, mode, airport)
│   └── AccessibilityContext.jsx    # Font size, high contrast, screen reader
├── hooks/
│   └── useChat.js                  # Chat messages, AI responses, feedback
├── utils/
│   ├── constants.js                # Design tokens, airports, languages
│   └── mockData.js                 # Sample flight, places, messages data
├── index.css                       # Complete design system
├── App.jsx                         # Root layout with providers
└── main.jsx                        # Entry point
```

## Tech Stack

- **React 19** + Vite
- **Vanilla CSS** with CSS custom properties
- **Inter** font (Google Fonts)
- No external UI libraries

## Design System

| Token | Value |
|-------|-------|
| Primary | `#4A90E2` |
| Background | `#F8F9FA` |
| Text | `#2C3E50` |
| Border Radius | `10px` |
| Grid | 8px base unit |
| Transitions | 200-300ms ease |
