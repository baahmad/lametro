import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import railLines from '../data/railLines.json';


const LA_CENTER = [34.0522, -118.2437];

function MetroMap({ vehicles }) {
  return (
    <MapContainer 
      center={LA_CENTER} 
      zoom={11} 
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Rail Lines */}
      {railLines.features.map((feature) => (
        <Polyline
            key={feature.properties.route_id}
            positions={feature.geometry.coordinates.map(([lon, lat]) => [lat, lon])}
            color={feature.properties.color}
            weight={3}
        />
      ))}
      
      {/* Vehicle Markers. */}
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