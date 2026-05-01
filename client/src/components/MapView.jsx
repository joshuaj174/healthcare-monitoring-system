import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const criticalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const normalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapView = ({ hospitals }) => {
  return (
    <div className="map-container">
      <MapContainer center={[20, 45]} zoom={3} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors & CARTO"
        />

        {hospitals.map((h) => (
          <Marker
            key={h._id}
            position={[h.latitude, h.longitude]}
            icon={h.status === 'Critical' ? criticalIcon : normalIcon}
          >
            <Popup>
              <strong>{h.name}</strong><br />
              Region: {h.region}<br />
              Status: <span style={{ color: h.status === 'Critical' ? 'red' : 'green' }}>{h.status}</span><br />
              Capacity: {h.capacity}%<br />
              Medicine Supply: {h.medicineSupply}%
            </Popup>
            {h.status === 'Critical' && (
              <Circle
                center={[h.latitude, h.longitude]}
                radius={50000}
                pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
              />
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;