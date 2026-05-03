import React from 'react';
import { useApp } from '../../context/AppContext';

export default function LeftPanel() {
  const { flight, location, userMode, toggleNavigation } = useApp();
  const isFirstTime = userMode === 'first-time';

  return (
    <aside className="left-panel" role="complementary" aria-label="Flight dashboard">
      {/* Status Card */}
      <div className="panel-card">
        <div className="card-title">📊 Your Status</div>
        <div className="status-badge on-track">✓ On Track</div>
        <div className="status-location">📍 {location.terminal}, {location.area}</div>
        <div className="status-time">Updated just now</div>
        {isFirstTime && (
          <div style={{ fontSize: '.8rem', color: '#6C757D', marginTop: 8, padding: '8px', background: '#F1F8F4', borderRadius: 6 }}>
            💡 This shows your current progress. Green means you're on schedule!
          </div>
        )}
      </div>

      {/* Flight Card */}
      <div className="panel-card">
        <div className="card-title">✈️ Flight Details</div>
        <div className="flight-route">
          <div>
            <div className="code">DEL</div>
            <div className="city">New Delhi</div>
          </div>
          <div className="arrow">→</div>
          <div>
            <div className="code">{flight.destination.code}</div>
            <div className="city">{flight.destination.city}</div>
          </div>
        </div>
        <div className="flight-grid">
          <div className="flight-field">
            <span className="label">Flight</span>
            <span className="value">{flight.flightNumber}</span>
          </div>
          <div className="flight-field">
            <span className="label">Status</span>
            <span className="value" style={{ color: '#52C41A' }}>✓ {flight.status}</span>
          </div>
          <div className="flight-field">
            <span className="label">Departure</span>
            <span className="value large">{flight.departureTime}</span>
          </div>
          <div className="flight-field">
            <span className="label">Gate</span>
            <span className="value gate">{flight.gate}</span>
          </div>
          <div className="flight-field">
            <span className="label">Boarding</span>
            <span className="value">{flight.boardingTime}</span>
          </div>
          <div className="flight-field">
            <span className="label">Seat</span>
            <span className="value">{flight.seatNumber}</span>
          </div>
        </div>
      </div>

      {/* Time to Gate */}
      <div className="panel-card">
        <div className="card-title">⏱ Time to Gate</div>
        <div className="time-gate">
          <div className="time-circle">
            <span className="mins">8</span>
            <span className="unit">min</span>
          </div>
          <div className="time-detail">📏 450 meters away</div>
          <div className="time-detail">🚶 Walking distance</div>
          <div className="time-recommendation">
            ✓ You have plenty of time. No rush!
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="panel-card">
        <div className="card-title">⚡ Quick Actions</div>
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={toggleNavigation} aria-label="Navigate to gate">
            <span className="icon">🗺️</span> Navigate
          </button>
          <button className="quick-action-btn" aria-label="Find food nearby">
            <span className="icon">🍽️</span> Food
          </button>
          <button className="quick-action-btn" aria-label="Baggage rules">
            <span className="icon">🧳</span> Baggage
          </button>
          <button className="quick-action-btn" aria-label="Find restrooms">
            <span className="icon">🚻</span> Restrooms
          </button>
        </div>
      </div>
    </aside>
  );
}
