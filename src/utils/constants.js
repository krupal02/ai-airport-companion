// Design tokens and constants for the AI Airport Companion

export const COLORS = {
  primary: '#4A90E2',
  primaryDark: '#3A7BC8',
  primaryLight: '#6BA3E8',
  teal: '#5CB8B2',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  textPrimary: '#2C3E50',
  textSecondary: '#6C757D',
  success: '#52C41A',
  successLight: '#F1F8F4',
  warning: '#FFA940',
  warningLight: '#FFF8E1',
  error: '#FF6B6B',
  errorLight: '#FFF0F0',
  accentBlue: '#E3F2FD',
  accentGreen: '#F1F8F4',
  border: '#E5E7EB',
  borderLight: '#F0F0F0',
  shadow: 'rgba(0,0,0,0.08)',
};

export const AIRPORTS = [
  { code: 'DEL', name: 'Indira Gandhi Int\'l', city: 'New Delhi' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Int\'l', city: 'Mumbai' },
  { code: 'BLR', name: 'Kempegowda Int\'l', city: 'Bengaluru' },
  { code: 'MAA', name: 'Chennai Int\'l', city: 'Chennai' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose Int\'l', city: 'Kolkata' },
  { code: 'HYD', name: 'Rajiv Gandhi Int\'l', city: 'Hyderabad' },
];

export const LANGUAGES = [
  { code: 'EN', name: 'English', flag: '🇮🇳' },
  { code: 'HI', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'TA', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'TE', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'BN', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'MR', name: 'मराठी', flag: '🇮🇳' },
];

export const FONT_SIZES = {
  small: 16,
  medium: 18,
  large: 20,
};

export const USER_MODES = {
  FIRST_TIME: 'first-time',
  FREQUENT: 'frequent',
};
