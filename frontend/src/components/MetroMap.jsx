import { MapContainer, TileLayer, CircleMarker, Polyline, Pane } from 'react-leaflet';
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
        {/* Map. */}
        <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        
        {/* Rail Lines. */}
        {railLines.features.map((feature) => (
            <Polyline
                key={feature.properties.route_id}
                positions={feature.geometry.coordinates.map(([lon, lat]) => [lat, lon])}
                color={feature.properties.color}
                weight={5}
            />
        ))}

        {/* Rail Stations. */}
        {railLines.stations.map((station) => (
            <CircleMarker
                key={station.stop_id}
                center={[station.lat, station.lon]}
                radius={3}
                fillColor="white"
                fillOpacity={1}
                color="black"
                weight={1}
            />
        ))}
      
        {/* Vehicle Markers. */}
        {vehicles.map((vehicle) => (
            <CircleMarker
                key={vehicle.vehicleId}
                center={[vehicle.latitude, vehicle.longitude]}
                radius={4}
                fillColor="black"
                fillOpacity={0.8}
                stroke={false}
            />
        ))}

        {/* Map labels. */}
        <Pane name="labels" style={{ zIndex: 650 }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            />
        </Pane>
    </MapContainer>
  );
}

export default MetroMap;