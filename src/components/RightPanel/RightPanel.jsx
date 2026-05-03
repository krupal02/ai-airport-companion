import React from 'react';
import { useApp } from '../../context/AppContext';

export default function RightPanel() {
  const { places, currentOffers, tips, weather, userMode, setShowNavigation, setNavDestination } = useApp();
  const isFrequent = userMode === 'frequent';

  const handleNavigate = (dest) => {
    setNavDestination(dest);
    setShowNavigation(true);
  };

  return (
    <aside className="right-panel" role="complementary" aria-label="Suggestions and nearby places">
      {/* Nearby Places */}
      <div>
        <div className="card-title">📍 Near You</div>
        {places.map(p => (
          <div 
            className="nearby-card" 
            key={p.id} 
            style={{ marginBottom: 10, position: 'relative', cursor: 'pointer' }}
            onClick={() => handleNavigate(p.name)}
          >
            <div className="nearby-icon">{p.icon}</div>
            <div className="nearby-info">
              <div className="nearby-name">{p.name}</div>
              <div className="nearby-meta">
                <span>{p.category}</span>
                <span>·</span>
                <span>🚶 {p.distance}</span>
                {p.rating && <span>· ⭐ {p.rating}</span>}
              </div>
            </div>
            {!isFrequent && <button className="nearby-nav-btn">Go</button>}
            {p.hasOffer && <span className="nearby-badge">{p.offerText}</span>}
          </div>
        ))}
      </div>

      {/* Offers */}
      <div>
        <div className="card-title">🏷️ Offers & Deals</div>
        {currentOffers.map(o => (
          <div 
            className="offer-card" 
            key={o.id} 
            style={{ marginBottom: 10, cursor: 'pointer' }}
            onClick={() => handleNavigate(o.store)}
          >
            <div className="offer-badge">{o.badge}</div>
            <div className="offer-store">{o.store}</div>
            <div className="offer-desc">{o.description}</div>
            <div className="offer-validity">⏰ {o.validity}</div>
            <div className="offer-cta">Navigate to Shop →</div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div>
        <div className="card-title">💡 Quick Tips</div>
        {tips.map(t => (
          <div className="tip-item" key={t.id} style={{ marginBottom: 8 }}>
            <span className="tip-icon">{t.icon}</span>
            <span className="tip-text">{t.text}</span>
          </div>
        ))}
      </div>

      {/* Weather */}
      <div className="panel-card">
        <div className="card-title">🌤 Weather at {weather.city}</div>
        <div className="weather-card">
          <div className="weather-icon">{weather.icon}</div>
          <div className="weather-temp">{weather.temperature}</div>
          <div className="weather-condition">{weather.condition}</div>
          <div style={{ fontSize: '.78rem', color: '#6C757D', marginTop: 4 }}>
            Humidity: {weather.humidity} · Feels like {weather.feelsLike}
          </div>
        </div>
      </div>
    </aside>
  );
}
