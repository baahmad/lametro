import { useState, useEffect } from 'react';
import './TripPanel.css';
import railLines from '../data/railLines.json';

function TripPanel({ selectedStation }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLine, setSelectedLine] = useState('');
    const [selectedDirection, setSelectedDirection] = useState('');
    const [arrivals, setArrivals] = useState([]);
    const [loading, setLoading] = useState(false);

    // Open the panel when a station is selected.
    useEffect(() => {
        if (selectedStation) {
            setIsOpen(true);
            setSelectedLine('');
            setSelectedDirection('');
            setArrivals([]);
        }
    }, [selectedStation]);

    useEffect(() => {
        if (selectedLine && selectedDirection && selectedStation) {
            setLoading(true);
            fetch(`http://localhost:8080/api/trip-updates?routeId=${selectedLine}&directionId=${selectedDirection}&stopId=${selectedStation.stop_id}`)
                .then(res => res.json())
                .then(data => {
                    setArrivals(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching arrivals:', err)
                    setLoading(false);
                })

        }
    }, [selectedLine, selectedDirection, selectedStation]);

    const availableLines = selectedStation 
        ? (railLines.stationLines[selectedStation.stop_id] || [])
        : [];

    return (
        <div className={`trip-panel ${isOpen ? 'open' : 'closed'}`}>
            <button 
                className="toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '◀' : '▶'}
            </button>
            
            {isOpen && (
                <div className="panel-content">
                    {selectedStation ? (
                        <>
                            <h2>{selectedStation.name}</h2>
                            
                            <label>Line & Direction</label>
                            <select 
                                value={`${selectedLine}_${selectedDirection}`}
                                onChange={(e) => {
                                    const [line, dir] = e.target.value.split('_');
                                    setSelectedLine(line);
                                    setSelectedDirection(dir);
                                }}
                            >
                                <option value="_">Select a line</option>
                                {availableLines.map((line, idx) => {
                                    const route = railLines.features.find(f => f.properties.route_id === line.route_id);
                                    return (
                                        <option key={idx} value={`${line.route_id}_${line.direction_id}`}>
                                            {route?.properties.name || line.route_id} - Direction {line.direction_id}
                                        </option>
                                    );
                                })}
                            </select>

                            {selectedLine && selectedDirection && (
                                <div className="arrivals">
                                    <h3>Next Arrivals</h3>
                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : arrivals.length > 0 ? (
                                        arrivals.map((arrival, idx) => (
                                            <p key={idx}>
                                                {new Date(arrival.arrivalTime * 1000).toLocaleTimeString()}
                                            </p>
                                        ))
                                    ) : (
                                        <p>No upcoming arrivals</p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p>Click a station on the map to see arrival times</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default TripPanel;
