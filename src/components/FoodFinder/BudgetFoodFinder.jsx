import { useState } from 'react';

export default function BudgetFoodFinder({ onClose }) {
  const [budget, setBudget] = useState(300);
  const [dietary, setDietary] = useState('vegetarian');
  const [cuisine, setCuisine] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const searchFood = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/food/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          dietary_preference: dietary,
          cuisine_type: cuisine || null,
          sort_by: 'price'
        })
      });
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content !max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🍽️ Find Food Within Budget</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="p-4 grid gap-4 bg-gray-900 rounded-xl mb-4 text-white">
          <div className="budget-selector">
            <label className="block text-sm text-gray-300 mb-2">Maximum Budget: ₹{budget}</label>
            <input 
              type="range" 
              className="w-full"
              min="100" 
              max="1000" 
              step="50"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="dietary-selector">
              <label className="block text-sm text-gray-300 mb-1">Dietary Preference:</label>
              <select className="w-full p-2 bg-gray-800 rounded border border-gray-700" value={dietary} onChange={(e) => setDietary(e.target.value)}>
                <option value="vegetarian">🥗 Vegetarian</option>
                <option value="non_vegetarian">🍗 Non-Vegetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="jain">🙏 Jain</option>
              </select>
            </div>
            
            <div className="cuisine-selector">
              <label className="block text-sm text-gray-300 mb-1">Cuisine Type (Optional):</label>
              <select className="w-full p-2 bg-gray-800 rounded border border-gray-700" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
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
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold mt-2"
          >
            {loading ? 'Searching...' : 'Search Restaurants'}
          </button>
        </div>
        
        <div className="recommendations-list space-y-3 overflow-y-auto max-h-96">
          {recommendations.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-8">Adjust budget or filters to see recommendations.</div>
          )}
          {recommendations.map((restaurant, idx) => (
            <div key={idx} className="bg-gray-800 p-4 rounded-xl text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{restaurant.name}</h4>
                  <p className="text-sm text-gray-400">{restaurant.cuisine_type || "Mixed"} • ⭐ {restaurant.rating}</p>
                </div>
                {restaurant.walk_time_min && (
                  <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs">
                    📍 {restaurant.walk_time_min} min walk
                  </span>
                )}
              </div>
              
              <div className="mt-3 bg-gray-900 p-3 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-2 font-medium">Top Options within ₹{budget}:</p>
                {restaurant.menu?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-800 last:border-0">
                    <span>{item.name}</span>
                    <span className="text-green-400 font-bold">₹{item.price || item.approx_price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
