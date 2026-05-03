import React, { createContext, useContext, useState, useCallback } from 'react';
import { USER_MODES, AIRPORTS, LANGUAGES } from '../utils/constants';
import { flightData, userLocation, nearbyPlaces, offers, quickTips, destinationWeather } from '../utils/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [userMode, setUserMode] = useState(() => {
    return localStorage.getItem('ac-userMode') || USER_MODES.FIRST_TIME;
  });

  const [airport, setAirport] = useState(AIRPORTS[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [flight, setFlight] = useState(flightData);
  const [location, setLocation] = useState(userLocation);
  const [places, setPlaces] = useState(nearbyPlaces);
  const [currentOffers, setCurrentOffers] = useState(offers);
  const [tips, setTips] = useState(quickTips);
  const [weather, setWeather] = useState(destinationWeather);
  const [showNavigation, setShowNavigation] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(null); // 'left', 'right', or null
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
  }, []);

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
        mobilePanel,
        coordinates,
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

export default AppContext;
