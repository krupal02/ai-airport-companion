// Mock data for the AI Airport Companion

export const flightData = {
  flightNumber: 'AI 505',
  airline: 'Air India',
  destination: { code: 'BOM', city: 'Mumbai' },
  departureTime: '14:30',
  gate: '5B',
  terminal: '2',
  boardingTime: '13:45',
  status: 'On Time',
  seatNumber: '12A',
  duration: '2h 10m',
};

export const userLocation = {
  terminal: 'Terminal 2',
  area: 'Near Security Checkpoint',
  coordinates: { x: 0.3, y: 0.5 },
};

export const nearbyPlaces = [
  {
    id: 1,
    name: 'Starbucks Coffee',
    category: 'Café',
    icon: '☕',
    distance: '45m',
    walkTime: '1 min',
    rating: 4.2,
    isOpen: true,
    image: null,
  },
  {
    id: 2,
    name: 'Duty Free Shop',
    category: 'Shopping',
    icon: '🛍️',
    distance: '30m',
    walkTime: '1 min',
    rating: 4.5,
    isOpen: true,
    hasOffer: true,
    offerText: '20% OFF',
    image: null,
  },
  {
    id: 3,
    name: 'Punjab Grill',
    category: 'Restaurant',
    icon: '🍽️',
    distance: '145m',
    walkTime: '2 min',
    rating: 4.0,
    isOpen: true,
    image: null,
  },
  {
    id: 4,
    name: 'WHSmith',
    category: 'Books & News',
    icon: '📚',
    distance: '55m',
    walkTime: '1 min',
    rating: 3.8,
    isOpen: true,
    image: null,
  },
];

export const offers = [
  {
    id: 1,
    store: 'Duty Free Shop',
    badge: '20% OFF',
    description: 'On all perfumes & cosmetics',
    validity: 'Valid for next 2 hours',
  },
  {
    id: 2,
    store: 'Starbucks Coffee',
    badge: 'BOGO',
    description: 'Buy 1 Get 1 Free on all beverages',
    validity: 'Valid until 3 PM',
  },
];

export const quickTips = [
  { id: 1, icon: '⏱', text: 'Security check: ~10 minutes wait' },
  { id: 2, icon: '🍽️', text: 'Lunch rush: 12-2 PM, plan ahead' },
  { id: 3, icon: '📢', text: 'Boarding starts in 45 minutes' },
  { id: 4, icon: '🔌', text: 'Charging stations near Gate 4' },
];

export const destinationWeather = {
  city: 'Mumbai',
  temperature: '32°C',
  condition: 'Partly Cloudy',
  icon: '⛅',
  humidity: '78%',
  feelsLike: '36°C',
};

export const initialMessages = [
  {
    id: 1,
    type: 'assistant',
    content: 'Welcome to Indira Gandhi International Airport! ✈️ I\'m your AI Airport Companion. I can help you navigate the terminal, find your gate, discover nearby restaurants, and much more.',
    timestamp: '10:15 AM',
  },
  {
    id: 2,
    type: 'assistant',
    content: 'Your flight AI 505 to Mumbai departs at 2:30 PM from Gate 5B. You have plenty of time! Would you like me to help you with anything?',
    timestamp: '10:15 AM',
    hasFlightInfo: true,
  },
];

export const suggestedPrompts = [
  { id: 1, text: 'Where is my gate?', icon: '🚪' },
  { id: 2, text: 'Food options nearby', icon: '🍽️' },
  { id: 3, text: 'Restroom locations', icon: '🚻' },
  { id: 4, text: 'Duty free shopping', icon: '🛍️' },
  { id: 5, text: 'Lounge access', icon: '🛋️' },
  { id: 6, text: 'Baggage rules', icon: '🧳' },
];

export const navigationSteps = [
  { id: 1, label: 'Current Location', detail: 'Terminal 2, Near Security', time: null, completed: true },
  { id: 2, label: 'Security Checkpoint', detail: 'Proceed through security screening', time: '3 min', completed: false, current: true },
  { id: 3, label: 'Turn Right', detail: 'After security, turn right towards Gates 1-10', time: '2 min', completed: false },
  { id: 4, label: 'Gate 5B', detail: 'Your departure gate', time: '3 min', completed: false },
];

export const sampleResponses = {
  'where is my gate': {
    content: 'Your gate is **5B** in **Terminal 2**. It\'s approximately **450 meters** away, about an **8-minute walk** from your current location.',
    hasNavigation: true,
    steps: [
      'Walk straight past the duty-free area for 100m',
      'Turn right at the Security Checkpoint',
      'Continue through the corridor for 200m',
      'Gate 5B will be on your left',
    ],
  },
  'food options nearby': {
    content: 'Here are some great food options near you:',
    hasPlaces: true,
    places: [
      { name: 'Starbucks Coffee', distance: '120m', rating: 4.2, category: 'Café' },
      { name: 'Punjab Grill', distance: '200m', rating: 4.0, category: 'Restaurant' },
      { name: 'Subway', distance: '180m', rating: 3.9, category: 'Fast Food' },
    ],
  },
  'restroom locations': {
    content: 'The nearest restrooms are located:',
    steps: [
      '**50 meters ahead** on your right (after WHSmith)',
      '**Near Gate 3** — 200 meters from here',
      '**Food court area** — 150 meters, past Starbucks',
    ],
  },
};
