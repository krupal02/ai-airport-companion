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

export default function RouteDisplay({ from, to }) {
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDirections = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/navigation/directions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from_location: from,
            to_location: to,
            mode: 'walking'
          })
        });
        if (!response.ok) throw new Error('Failed to fetch route');
        const data = await response.json();
        setDirections(data);
      } catch (err) {
        console.error('Failed to fetch directions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (from && to) fetchDirections();
  }, [from, to]);
  
  if (loading) return <div style={{padding: '16px', textAlign: 'center'}}>Loading route...</div>;
  if (error || !directions) return <div style={{padding: '16px', color: '#EF4444'}}>Unable to load directions</div>;
  
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px', color: 'var(--text)', border: '1px solid var(--surface-border)' }}>
      {/* Summary Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          ⏱️ {directions.total_duration}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-sec)' }}>
          📏 {directions.total_distance}
        </div>
      </div>
      
      {/* Step-by-Step Instructions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {directions.steps.map((step, index) => (
          <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginTop: '4px' }}>{step.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sec)', marginBottom: '4px' }}>Step {step.step_number}</div>
              <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{step.instruction}</div>
              {step.landmark && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '4px' }}>🏛️ {step.landmark}</div>
              )}
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '8px' }}>
                {step.distance} • {step.duration}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Offline Leaflet Map */}
      <div style={{ marginTop: '16px', height: '256px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
        <MapContainer center={[28.5562, 77.0844]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[28.5562, 77.0844]}><Popup>You are here</Popup></Marker>
          <Marker position={[28.5497, 77.0891]}><Popup>Destination</Popup></Marker>
          <Polyline positions={[[28.5562, 77.0844], [28.5530, 77.0840], [28.5497, 77.0891]]} color="#60A5FA" weight={4} />
        </MapContainer>
      </div>

      <div style={{ marginTop: '16px', fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-sec)' }}>
        📍 Navigation powered by Offline OpenStreetMap & Leaflet
      </div>
    </div>
  );
}
