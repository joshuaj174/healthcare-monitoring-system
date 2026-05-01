import { useState } from 'react';
import { suggestHospital } from '../services/hospitalService';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const patientIcon = new L.Icon({
  iconUrl:    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl:  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
});

const suggestIcon = new L.Icon({
  iconUrl:    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl:  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
});

const getRankColor = (index) => {
  if (index === 0) return '#ffd700';
  if (index === 1) return '#c0c0c0';
  return '#cd7f32';
};

const getRankLabel = (index) => {
  if (index === 0) return 'Best Match';
  if (index === 1) return '2nd Nearest';
  return '3rd Nearest';
};

const BedFinder = () => {
  const [lat, setLat]         = useState('');
  const [lng, setLng]         = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [searched, setSearched] = useState(false);
  const [locating, setLocating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setError('Could not get your location. Please allow location access or enter manually.');
        setLocating(false);
      }
    );
  };

  const handleSearch = async () => {
    if (!lat || !lng) {
      setError('Please enter your coordinates or use My Location');
      return;
    }
    setLoading(true);
    setError('');
    setResults([]);
    setSearched(false);
    try {
      const res = await suggestHospital(parseFloat(lat), parseFloat(lng));
      setResults(res.data);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'No available hospitals found nearby');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', padding: '24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#e6edf3', margin: '0 0 4px', fontWeight: 700 }}>
        Find Nearest Available Hospital
        </h4>
        <p style={{ color: '#8b949e', margin: 0, fontSize: '13px' }}>
          Enter your location or use live GPS to find the 3 nearest non-critical hospitals.
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

          {/* Latitude */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              YOUR LATITUDE
            </label>
            <input
              type="number"
              placeholder="e.g. 19.0760"
              value={lat}
              onChange={e => setLat(e.target.value)}
              style={{
                width: '100%',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                color: '#e6edf3',
                fontSize: '13px',
                padding: '10px 12px',
                outline: 'none',
              }}
            />
          </div>

          {/* Longitude */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              YOUR LONGITUDE
            </label>
            <input
              type="number"
              placeholder="e.g. 72.8777"
              value={lng}
              onChange={e => setLng(e.target.value)}
              style={{
                width: '100%',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                color: '#e6edf3',
                fontSize: '13px',
                padding: '10px 12px',
                outline: 'none',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={useMyLocation}
              disabled={locating}
              style={{
                background: '#1f3a5f',
                border: '1px solid #1f6feb',
                borderRadius: '8px',
                color: '#58a6ff',
                fontSize: '13px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {locating ? 'Locating...' : 'Use My Location'}
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                background: '#1f6feb',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Searching...' : 'Find Hospital'}
            </button>
          </div>
        </div>

        {/* Coordinates display */}
        {lat && lng && (
          <div style={{
            marginTop: '12px', fontSize: '12px', color: '#8b949e',
            background: '#0d1117', padding: '8px 12px',
            borderRadius: '6px', border: '1px solid #30363d',
          }}>
          Searching from: <span style={{ color: '#58a6ff' }}>{lat}, {lng}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '12px', fontSize: '12px', color: '#ff6b6b',
            background: '#3d0000', padding: '10px 14px',
            borderRadius: '6px', border: '1px solid #7d0000',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: '#69db7c', fontWeight: 500 }}>
            Found {results.length} available hospitals — sorted by distance from your location
            </span>
          </div>

          {/* Result Cards */}
          <div className="row g-3 mb-4">
            {results.map((h, index) => (
              <div className="col-md-4" key={h._id}>
                <div style={{
                  background: '#161b22',
                  border: `1px solid ${getRankColor(index)}`,
                  borderRadius: '12px',
                  padding: '18px',
                  height: '100%',
                }}>
                  {/* Rank */}
                  <div style={{
                    fontSize: '12px', fontWeight: 700,
                    color: getRankColor(index), marginBottom: '10px',
                  }}>
                    {getRankLabel(index)}
                  </div>

                  {/* Name */}
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3', marginBottom: '2px' }}>
                    {h.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '14px' }}>
                    {h.region}
                  </div>

                  {/* Distance */}
                  <div style={{
                    textAlign: 'center', padding: '12px',
                    background: '#0d1117', borderRadius: '8px',
                    border: '1px solid #30363d', marginBottom: '14px',
                  }}>
                    <div style={{
                      fontSize: '28px', fontWeight: 700,
                      color: getRankColor(index),
                    }}>
                      {h.distance.toFixed(1)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>km from you</div>
                  </div>

                  {/* Status */}
                  <div style={{
                    display: 'flex', justifyContent: 'center',
                    marginBottom: '14px',
                  }}>
                    <span style={{
                      fontSize: '11px', padding: '3px 12px', borderRadius: '20px',
                      background: '#003d1a', color: '#69db7c',
                      border: '1px solid #007d35', fontWeight: 600,
                    }}>
                      ✅ Available
                    </span>
                  </div>

                  {/* Capacity bar */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '10px', color: '#8b949e' }}>Bed Capacity</span>
                      <span style={{ fontSize: '10px', color: '#69db7c', fontWeight: 600 }}>{h.capacity}%</span>
                    </div>
                    <div style={{ height: '5px', background: '#30363d', borderRadius: '3px' }}>
                      <div style={{
                        height: '100%', width: `${h.capacity}%`,
                        background: '#28a745', borderRadius: '3px',
                      }} />
                    </div>
                  </div>

                  {/* Medicine bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '10px', color: '#8b949e' }}>Medicine Supply</span>
                      <span style={{ fontSize: '10px', color: '#74c0fc', fontWeight: 600 }}>{h.medicineSupply}%</span>
                    </div>
                    <div style={{ height: '5px', background: '#30363d', borderRadius: '3px' }}>
                      <div style={{
                        height: '100%', width: `${h.medicineSupply}%`,
                        background: '#0dcaf0', borderRadius: '3px',
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '12px',
          }}>
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid #30363d',
              fontSize: '13px', fontWeight: 600, color: '#e6edf3',
            }}>
              🗺️ Route Map
            </div>
            <div style={{ height: '380px' }}>
              <MapContainer
                center={[parseFloat(lat), parseFloat(lng)]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Patient marker */}
                <Marker position={[parseFloat(lat), parseFloat(lng)]} icon={patientIcon}>
                  <Popup>
                    <strong>Your Location</strong><br />
                    {lat}, {lng}
                  </Popup>
                </Marker>

                {/* Hospital markers + lines */}
                {results.map((h, index) => (
                  <div key={h._id}>
                    <Marker position={[h.latitude, h.longitude]} icon={suggestIcon}>
                      <Popup>
                        <strong>{h.name}</strong><br />
                        Distance: {h.distance.toFixed(1)} km<br />
                        Capacity: {h.capacity}%<br />
                        Medicine: {h.medicineSupply}%
                      </Popup>
                    </Marker>
                    <Polyline
                      positions={[
                        [parseFloat(lat), parseFloat(lng)],
                        [h.latitude, h.longitude],
                      ]}
                      pathOptions={{
                        color: getRankColor(index),
                        weight: 2,
                        dashArray: '6 6',
                        opacity: 0.8,
                      }}
                    />
                  </div>
                ))}
              </MapContainer>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#8b949e' }}>
            🔵 Blue = your location · 🟢 Green = suggested hospitals · Dashed lines show distance
          </div>
        </>
      )}

      {/* Empty state */}
      {searched && results.length === 0 && !error && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: '12px',
        }}>
          <div style={{ color: '#e6edf3', fontWeight: 500, marginBottom: '6px' }}>
            No available hospitals found
          </div>
          <div style={{ color: '#8b949e', fontSize: '13px' }}>
            All nearby hospitals may be at critical capacity.
          </div>
        </div>
      )}
    </div>
  );
};

export default BedFinder;