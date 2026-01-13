import { useState, useEffect } from 'react';
import './TripPanel.css';
import railLines from '../data/railLines.json';
import { API_BASE_URL } from '../config';


function TripPanel({ 
    selectedStation, 
    onStationSelect, 
    selectedLine,
    onLineChange,
    selectedDirection,
    onDirectionChange,
    isOpen, 
    setIsOpen 
}) {
    const [arrivals, setArrivals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [tripDetails, setTripDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const filteredStations = railLines.stations.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (selectedStation) {
            setIsOpen(true);
            onLineChange('');
            onDirectionChange('');
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

    useEffect(() => {
        if (selectedTrip) {
            fetch(`${API_BASE_URL}/api/trip-details?tripId=${selectedTrip}`)
                .then(res => res.json())
                .then(data => setTripDetails(data))
                .catch(err => console.error('Error fetching trip details:', err));
        } else {
            setTripDetails([]);
        }
    }, [selectedTrip]);

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
                    <button 
                        className="close-btn"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </button>

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
                                    onLineChange(line);
                                    onDirectionChange(dir);
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
                                            <div key={idx} className="arrival-item">
                                                <p 
                                                    className="arrival-time"
                                                    onClick={() => setSelectedTrip(
                                                        selectedTrip === arrival.tripId ? null : arrival.tripId
                                                    )}
                                                >
                                                    {new Date(arrival.arrivalTime * 1000).toLocaleTimeString()}
                                                    <span className="expand-icon">
                                                        {selectedTrip === arrival.tripId ? '▼' : '▶'}
                                                    </span>
                                                </p>
                                                {selectedTrip === arrival.tripId && tripDetails.length > 0 && (
                                                    <ul className="trip-stops">
                                                        {tripDetails.map((stop, stopIdx) => {
                                                            const station = railLines.stations.find(s => 
                                                                s.stopIds?.some(id => stop.stopId.startsWith(id))
                                                            );
                                                            return (
                                                                <li key={stopIdx}>
                                                                    <span className="stop-time">
                                                                        {new Date(stop.arrivalTime * 1000).toLocaleTimeString()}
                                                                    </span>
                                                                    <span className="stop-name">
                                                                        {station?.name || stop.stopId}
                                                                    </span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
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
