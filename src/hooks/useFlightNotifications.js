import { useState, useEffect } from 'react';

export const useFlightNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);

  
  useEffect(() => {
    if (!userId) return;
    
    // Establish WebSocket connection
    const websocket = new WebSocket(`ws://localhost:8000/ws/flight-updates/${userId}`);
    
    websocket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [...prev, notification]);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('Flight Update', {
          body: notification.action_required,
          tag: 'flight-change',
          requireInteraction: true
        });
      }
    };
    
    // Websocket is managed locally and cleaned up in return
    // Cleanup
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [userId]);
  
  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.timestamp !== notificationId));
  };
  
  return { notifications, dismissNotification };
};
