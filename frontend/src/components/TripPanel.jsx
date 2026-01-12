import { useState, useEffect } from 'react';
import './TripPanel.css';
import railLines from '../data/railLines.json';
import { API_BASE_URL } from '../config';


function TripPanel({ selectedStation, onStationSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLine, setSelectedLine] = useState('');
    const [selectedDirection, setSelectedDirection] = useState('');
    const [arrivals, setArrivals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const filteredStations = railLines.stations.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            // Build stopIds parameter from station's stopIds array
            const stopIdsParam = selectedStation.stopIds?.join(',') || selectedStation.stop_id;
            fetch(`${API_BASE_URL}/api/trip-updates?routeId=${selectedLine}&directionId=${selectedDirection}&stopIds=${stopIdsParam}`)
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

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search stations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowResults(true)}
                        />
                        {showResults && searchQuery && (
                            <ul className="search-results">
                                {filteredStations.map(station => (
                                    <li 
                                        key={station.stop_id}
                                        onClick={() => {
                                            onStationSelect(station);
                                            setSearchQuery('');
                                            setShowResults(false);
                                        }}
                                    >
                                        {station.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

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
                                    const directionType = route?.properties.directionType || 'north-south';
                                    const directionLabel = directionType === 'north-south'
                                        ? (line.direction_id === 1 ? 'Southbound' : 'Northbound')
                                        : (line.direction_id === 1 ? 'Westbound' : 'Eastbound');
                                    return (
                                        <option key={idx} value={`${line.route_id}_${line.direction_id}`}>
                                            {route?.properties.name || line.route_id} - {directionLabel}
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
