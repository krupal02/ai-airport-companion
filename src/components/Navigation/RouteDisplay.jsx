import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Constants for all POIs to show on map
const ALL_POIS = [
  { name: 'Starbucks Coffee', coords: [28.5565, 77.0855], type: 'cafe' },
  { name: 'Punjab Grill', coords: [28.5568, 77.0850], type: 'restaurant' },
  { name: 'WHSmith', coords: [28.5563, 77.0842], type: 'shop' },
  { name: 'Duty Free Shop', coords: [28.5561, 77.0852], type: 'shop' },
  { name: 'Gate 5B', coords: [28.5570, 77.0860], type: 'gate' },
  { name: 'Gate 42', coords: [28.5566, 77.0848], type: 'gate' },
  { name: 'Security Checkpoint', coords: [28.5560, 77.0845], type: 'info' },
  { name: 'Food Court', coords: [28.5567, 77.0851], type: 'food' },
  { name: 'Nearest Restroom', coords: [28.5564, 77.0840], type: 'service' },
];

export default function RouteDisplay({ to }) {
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // SIMULATE OFFLINE LOGIC - Instant response
    const generateMockRoute = () => {
      setLoading(true);
      const targetPOI = ALL_POIS.find(p => p.name === to) || ALL_POIS[0];
      const startPos = [28.5560, 77.0844]; // Approximate user location
      
      // Mock path logic
      const mockData = {
        total_duration: to === 'Nearest Restroom' ? '1 min' : '3 min',
        total_distance: to === 'Nearest Restroom' ? '120m' : '340m',
        steps: [
          {
            icon: '🚶',
            instruction: 'Start walking from your current location',
            distance: '20m',
            duration: '30s',
            coords: startPos
          },
          {
            icon: '➡️',
            instruction: `Turn right towards ${to}`,
            distance: '100m',
            duration: '1 min',
            landmark: 'Near Security Zone',
            coords: [startPos[0] + 0.0002, startPos[1] + 0.0002]
          },
          {
            icon: '🎯',
            instruction: `Arrive at ${to}`,
            distance: '10m',
            duration: '10s',
            coords: targetPOI.coords
          }
        ],
        route_geometry: [
          startPos,
          [startPos[0] + 0.0002, startPos[1] + 0.0002],
          targetPOI.coords
        ]
      };

      setTimeout(() => {
        setDirections(mockData);
        setLoading(false);
      }, 500); // Small delay for "realism" but no connection needed
    };

    if (to) generateMockRoute();
  }, [to]);
  
  if (loading) return (
    <div style={{padding: '30px', textAlign: 'center', background: 'var(--surface)', borderRadius: '12px'}}>
      <div className="typing-indicator" style={{justifyContent: 'center', marginBottom: '10px'}}>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      Locating destination...
    </div>
  );
  
  return (
    <div className="route-display-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Route Info Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🕒</span>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-sec)', textTransform: 'uppercase' }}>Est. Time</div>
            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{directions.total_duration}</div>
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>📏</span>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-sec)', textTransform: 'uppercase' }}>Distance</div>
            <div style={{ fontWeight: 'bold' }}>{directions.total_distance}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Instructions List */}
        <div style={{ overflowY: 'auto', paddingRight: '4px', maxHeight: '350px' }} className="custom-scrollbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {directions.steps.map((step, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.4rem' }}>{step.icon}</div>
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.85rem', marginBottom: '2px' }}>{step.instruction}</div>
                  {step.landmark && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>🏛️ {step.landmark}</div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-sec)', marginTop: '4px' }}>
                    {step.distance} • {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Map View */}
        <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--surface-border)', background: '#1e293b' }}>
          <MapContainer 
            center={directions.steps[0].coords} 
            zoom={17} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Show ALL Shops on Map */}
            {ALL_POIS.map((poi, idx) => (
              <Marker key={`poi-${idx}`} position={poi.coords}>
                <Popup>
                  <div style={{color: '#000'}}>
                    <strong>{poi.name}</strong>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Current Route Polyline */}
            {directions.route_geometry && (
              <Polyline positions={directions.route_geometry} color="#3B82F6" weight={5} opacity={0.8} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
