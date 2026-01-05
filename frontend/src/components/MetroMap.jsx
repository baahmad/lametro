import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const NYC_CENTER = [40.7128, -74.006];

function MetroMap({ vehicles }) {
  return (
    <MapContainer 
      center={NYC_CENTER} 
      zoom={11} 
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {vehicles.map((vehicle) => (
        <CircleMarker
          key={vehicle.vehicleId}
          center={[vehicle.latitude, vehicle.longitude]}
          radius={6}
          fillColor="blue"
          fillOpacity={0.8}
          stroke={false}
        />
      ))}
    </MapContainer>
  );
}

export default MetroMap;