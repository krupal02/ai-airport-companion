import { useState } from 'react';

export default function BudgetFoodFinder({ onClose }) {
  const [budget, setBudget] = useState(300);
  const [dietary, setDietary] = useState('vegetarian');
  const [cuisine, setCuisine] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const searchFood = async () => {
    setLoading(true);
    setRecommendations([]);
    
    // OFFLINE MOCK DATA
    const mockRestaurants = [
      {
        name: 'Starbucks Coffee',
        rating: 4.5,
        cuisine_type: 'Cafe',
        walk_time_min: 1,
        menu: [
          { name: 'Java Chip Frappuccino', price: 345 },
          { name: 'Paneer Tikka Sandwich', price: 280 }
        ]
      },
      {
        name: 'Punjab Grill',
        rating: 4.2,
        cuisine_type: 'North Indian',
        walk_time_min: 2,
        menu: [
          { name: 'Butter Chicken Bento', price: 450 },
          { name: 'Dal Makhani Combo', price: 380 }
        ]
      },
      {
        name: 'Cafeccino',
        rating: 3.8,
        cuisine_type: 'Fast Food',
        walk_time_min: 1,
        menu: [
          { name: 'Aloo Tikki Burger', price: 120 },
          { name: 'Masala Chai', price: 80 }
        ]
      },
      {
        name: 'Street Foods by Punjab Grill',
        rating: 4.0,
        cuisine_type: 'Street Food',
        walk_time_min: 2,
        menu: [
          { name: 'Chole Bhature', price: 250 },
          { name: 'Pav Bhaji', price: 180 }
        ]
      }
    ];

    setTimeout(() => {
      // Filter based on budget
      const results = mockRestaurants.filter(r => 
        r.menu.some(item => item.price <= budget)
      );
      setRecommendations(results);
      setLoading(false);
    }, 800);
  };
  
  return (
    <div className="onboarding-overlay" onClick={onClose}>
      <div className="food-modal" onClick={e => e.stopPropagation()}>
        <div className="food-modal-header">
          <h2>🍽️ Find Food Within Budget</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="food-modal-body">
          <div className="food-filters">
            <div className="filter-section">
              <label className="filter-label">Maximum Budget: ₹{budget}</label>
              <input 
                type="range" 
                className="a11y-slider"
                min="100" 
                max="1500" 
                step="50"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>₹100</span>
                <span>₹1500</span>
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-section compact">
                <label className="filter-label">Dietary Preference</label>
                <div className="chip-group small">
                  {['vegetarian', 'non_vegetarian', 'vegan', 'jain'].map(d => (
                    <button 
                      key={d}
                      className={`chip small ${dietary === d ? 'active' : ''}`}
                      onClick={() => setDietary(d)}
                    >
                      {d.replace('_', ' ').charAt(0).toUpperCase() + d.replace('_', ' ').slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-section compact">
                <label className="filter-label">Cuisine Type</label>
                <select 
                  className="form-group select-field !mb-0" 
                  style={{width: '100%', background: 'var(--bg)', border: '1px solid var(--surface-border)', borderRadius: '10px', padding: '8px', color: 'var(--text)'}}
                  value={cuisine} 
                  onChange={(e) => setCuisine(e.target.value)}
                >
                  <option value="">All Cuisines</option>
                  <option value="North Indian">North Indian</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Fast Food">Fast Food</option>
                  <option value="Cafe">Cafe</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={searchFood} 
              className="btn-primary search-btn"
              disabled={loading}
            >
              {loading ? '🔍 Finding Best Matches...' : '🚀 Search Best Options'}
            </button>
          </div>
          
          <div className="food-results">
            {loading ? (
              <div className="food-loading">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="food-empty">
                <p>No matches found in this budget.</p>
                <p style={{fontSize: '0.8rem', opacity: 0.6}}>Try increasing your budget or changing filters.</p>
              </div>
            ) : (
              recommendations.map((restaurant, idx) => (
                <div key={idx} className="restaurant-card">
                  <div className="rest-header">
                    <div className="rest-name">{restaurant.name}</div>
                    <div className="rest-rating">⭐ {restaurant.rating}</div>
                  </div>
                  <div className="rest-meta">
                    <span>{restaurant.cuisine_type || "Multi-cuisine"}</span>
                    {restaurant.walk_time_min && (
                      <span className="rest-price">📍 {restaurant.walk_time_min} min walk</span>
                    )}
                  </div>
                  
                  <div className="rest-menu-wrap" style={{marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
                    <div className="menu-label">Recommended for you:</div>
                    <div className="rest-menu">
                      {restaurant.menu?.slice(0, 3).map((item, i) => (
                        <div key={i} className="menu-item">
                          {item.name} <small>₹{item.price || item.approx_price}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
