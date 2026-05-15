/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { USER_MODES, AIRPORTS, LANGUAGES } from '../utils/constants';
import { flightData, userLocation, nearbyPlaces, offers, quickTips, destinationWeather } from '../utils/mockData';

 
export const AppContext = createContext();

export function AppProvider({ children }) {
  // ── Existing state ─────────────────────────────────────
  const [airport, setAirport] = useState(AIRPORTS[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [flight, setFlight] = useState(flightData);

  const [userMode, setUserMode] = useState(() => {
    return localStorage.getItem('ac-userMode') || USER_MODES.FIRST_TIME;
  });

  // ── User Profile (from onboarding) ────────────────────
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('aeroguide_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return !!localStorage.getItem('aeroguide_user_profile');
  });

  const completeOnboarding = useCallback((profile) => {
    setUserProfile(profile);
    setOnboardingComplete(true);
    // Sync travel frequency to existing userMode system
    const modeMap = { first_time: USER_MODES.FIRST_TIME, occasional: USER_MODES.FIRST_TIME, frequent: USER_MODES.FREQUENT };
    const mode = modeMap[profile.travel_frequency] || USER_MODES.FIRST_TIME;
    setUserMode(mode);
    localStorage.setItem('ac-userMode', mode);

    // DYNAMIC FLIGHT DATA BASED ON PNR/FLIGHT NUMBER
    if (profile.flight_number || profile.pnr) {
      const identifier = (profile.flight_number || profile.pnr).toUpperCase();
      setFlight(prev => ({
        ...prev,
        flightNumber: identifier,
        gate: identifier.includes('6E') ? '12A' : (identifier.includes('UK') ? '8C' : '5B'),
        terminal: identifier.includes('6E') ? 'Terminal 2' : 'Terminal 3',
        departureTime: identifier.includes('6E') ? '18:45' : '14:30',
        boardingTime: identifier.includes('6E') ? '18:00' : '13:45',
      }));
    }
  }, []);

  const resetProfile = useCallback(() => {
    localStorage.removeItem('aeroguide_user_profile');
    setUserProfile(null);
    setOnboardingComplete(false);
  }, []);

  // ── Feature modals ─────────────────────────────────────
  const [showFoodFinder, setShowFoodFinder] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  // ── Existing state ─────────────────────────────────────
  const [location, setLocation] = useState(userLocation);
  const [places] = useState(nearbyPlaces);
  const [currentOffers] = useState(offers);
  const [tips] = useState(quickTips);
  const [weather] = useState(destinationWeather);
  const [showNavigation, setShowNavigation] = useState(false);
  const [navDestination, setNavDestination] = useState(null);
  const [mobilePanel, setMobilePanel] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  const updateUserMode = useCallback((mode) => {
    setUserMode(mode);
    localStorage.setItem('ac-userMode', mode);
  }, []);

  const updateAirport = useCallback((airportData) => {
    setAirport(airportData);
    // DYNAMIC FLIGHT DATA BASED ON AIRPORT
    setFlight(prev => ({
      ...prev,
      terminal: airportData.id === 'BOM' ? 'Terminal 2 (Mumbai)' : (airportData.id === 'BLR' ? 'Terminal 2 (Bengaluru)' : 'Terminal 3 (Delhi)'),
      status: airportData.id === 'BOM' ? 'Delayed' : 'On Time'
    }));
  }, [setAirport, setFlight]);

  const updateLanguage = useCallback((lang) => {
    setLanguage(lang);
  }, []);

  const toggleNavigation = useCallback(() => {
    setShowNavigation(prev => !prev);
  }, []);

  const toggleMobilePanel = useCallback((panel) => {
    setMobilePanel(prev => prev === panel ? null : panel);
  }, []);

  return (
    <AppContext.Provider
      value={{
        userMode,
        airport,
        language,
        flight,
        location,
        places,
        currentOffers,
        tips,
        weather,
        showNavigation,
        setShowNavigation,
        navDestination,
        setNavDestination,
        mobilePanel,
        coordinates,
        // New profile state
        userProfile,
        onboardingComplete,
        completeOnboarding,
        resetProfile,
        // Feature modals
        showFoodFinder,
        setShowFoodFinder,
        showSecurityInfo,
        setShowSecurityInfo,
        // Existing actions
        updateUserMode,
        updateAirport,
        updateLanguage,
        toggleNavigation,
        toggleMobilePanel,
        setFlight,
        setLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
