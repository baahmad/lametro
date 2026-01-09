import './MapLegend.css';
import railLines from '../data/railLines.json'

function MapLegend() {
    return (
        <div className="map-legend">
            <h4>Legend</h4>
            {railLines.features.map((line) => (
                <div key={line.properties.route_id} className="legend-item">
                    <span
                        className="legend-line"
                        style={{ backgroundColor: line.properties.color}}
                    />
                    <span>{line.properties.name}</span>
                </div>
            ))}

            <div className="legend-item">
                <span className="legend-dot vehicle" />
                <span>Vehicle</span>
            </div>

            <div className="legend-item">
                <span className="legend-dot station" />
                <span>Station</span>
            </div>
        </div>
    );
}

export default MapLegend;