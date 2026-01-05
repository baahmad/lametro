import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const BAY_AREA_CENTER = [37.7749, -122.4194];

function MetroMap({ vehicles }) {
  return (
    <MapContainer 
      center={BAY_AREA_CENTER} 
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