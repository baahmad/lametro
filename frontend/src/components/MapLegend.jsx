import { useState } from 'react';
import './MapLegend.css';
import AboutModal from './AboutModal';
import railLines from '../data/railLines.json'

function MapLegend({ isPanelOpen }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAbout, setShowAbout] = useState(false);

    return (
        <div className={`map-legend ${isPanelOpen ? 'panel-open' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <button 
                className="legend-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>Legend</span>
                <span className="toggle-icon">{isExpanded ? '▼' : '▲'}</span>
            </button>
            {isExpanded && (
                <div className="legend-content">
                    {railLines.features.map((line) => (
                        <div key={line.properties.route_id} className="legend-item">
                            <span
                                className="legend-line"
                                style={{ backgroundColor: line.properties.color }}
                            />
                            <span>{line.properties.name}</span>
                        </div>
                    ))}
                    <div className="legend-item">
                        <span className="legend-dot vehicle" />
                        <span>Train</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot station" />
                        <span>Station</span>
                    </div>
                    <button className="about-link" onClick={() => setShowAbout(true)}>
                        About
                    </button>
                    <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
                </div>
            )}
        </div>
    );
}

export default MapLegend;
