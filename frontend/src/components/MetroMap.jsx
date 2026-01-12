import { MapContainer, TileLayer, CircleMarker, Polyline, Pane, ZoomControl, Tooltip, useMap, Marker } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import railLines from '../data/railLines.json';


const LA_CENTER = [34.0522, -118.2437];
const SPRUCE_GOOSE = [33.9745, -118.4193];
const gooseIcon = L.divIcon({
    html: '🪿',
    className: 'goose-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
});

function ZoomTracker({ setZoom }) {
    const map = useMap();
    
    useEffect(() => {
        setZoom(map.getZoom());
        
        const handleZoom = () => {
            setZoom(map.getZoom());
        };
        
        map.on('zoomend', handleZoom);
        return () => map.off('zoomend', handleZoom);
    }, [map, setZoom]);
    
    return null;
}

function MetroMap({ vehicles, onStationClick }) {
    const [zoom, setZoom] = useState(11)
    return (
        <MapContainer 
        center={LA_CENTER} 
        zoom={11}
        zoomControl={false}
        style={{ height: '100vh', width: '100%' }}
        >
            <ZoomTracker setZoom={setZoom} />
            <ZoomControl position="topright" />
            
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
                    key={`${station.stop_id}-${zoom >= 13}`}
                    center={[station.lat, station.lon]}
                    radius={4}
                    fillColor="white"
                    fillOpacity={1}
                    color="black"
                    weight={2}
                    eventHandlers={{
                        click: () => onStationClick(station)
                    }}
                >
                    {zoom >= 13 ? (
                        <Tooltip direction="top" offset={[0, -5]} opacity={0.9} permanent className="station-tooltip">
                            {station.name.split(/\s[-\/]\s/).map((part, i) => (
                                <span key={i}>{i > 0 && <br />}{part}</span>
                            ))}
                        </Tooltip>
                    ) : (
                        <Tooltip direction="top" offset={[0, -5]} opacity={0.9} className="station-tooltip">
                            {station.name.split(/\s[-\/]\s/).map((part, i) => (
                                <span key={i}>{i > 0 && <br />}{part}</span>
                            ))}
                        </Tooltip>
                    )}
                </CircleMarker>
            ))}
      
            {/* Vehicle Markers. */}
            {vehicles.map((vehicle) => (
                <CircleMarker
                    key={vehicle.vehicleId}
                    center={[vehicle.latitude, vehicle.longitude]}
                    radius={5}
                    fillColor="black"
                    fillOpacity={0.8}
                    stroke={false}
                />
            ))}

            {/* Spruce Goose Campus */}
            <Marker position={SPRUCE_GOOSE} icon={gooseIcon}>
                <Tooltip>Spruce Goose!!</Tooltip>
            </Marker>

            {/* Map labels. */}
            {zoom < 13 && (
                <Pane name="labels" style={{ zIndex: 650 }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                    />
                </Pane>
            )}
        </MapContainer>
    );
}

export default MetroMap;