import { useState, useEffect, useRef } from 'react';
import './TripPanel.css';
import railLines from '../data/railLines.json';
import { API_BASE_URL } from '../config';
import usePanelSwipe from '../hooks/usePanelSwipe';
import DirectionSelector from './DirectionSelector';

/**
 * Slide-out panel for selecting stations, lines, directions, and viewing arrivals.
 * @param {object} selectedStation - The currently selected station object.
 * @param {function} onStationSelect - Callback when a station is selected.
 * @param {string} selectedLine - The currently selected rail line route ID.
 * @param {function} onLineChange - Callback when line selection changes.
 * @param {string} selectedDirection - The currently selected direction ID.
 * @param {function} onDirectionChange - Callback when direction selection changes.
 * @param {boolean} isOpen - Whether the panel is open.
 * @param {function} setIsOpen - Function to set the panel open state.
 */
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

    // Swipe handling for mobile.
    const panelWidth = typeof window !== 'undefined' && window.innerWidth <= 768
        ? window.innerWidth
        : 320;
    const {
        isDragging,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        getPanelStyle,
    } = usePanelSwipe(isOpen, setIsOpen, panelWidth);

    const prevStationRef = useRef(null);
    useEffect(() => {
        if (selectedStation) {
            setIsOpen(true);
            // Only clear line/direction when station actually changes, not on initial load.
            if (prevStationRef.current && prevStationRef.current.stop_id !== selectedStation.stop_id) {
                onLineChange('');
                onDirectionChange('');
                setArrivals([]);
            }
            prevStationRef.current = selectedStation;
        }
    }, [selectedStation]);

    useEffect(() => {
        if (selectedLine && selectedDirection && selectedStation) {
            setLoading(true);
            // Build stopIds parameter from station's stopIds array.
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
        <>
            {/* Swipe edge - visible when panel is closed */}
            {!isOpen && (
                <div
                    className="swipe-edge"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
            )}
            <div
                className={`trip-panel ${isOpen ? 'open' : 'closed'} ${isDragging ? 'dragging' : ''}`}
                style={getPanelStyle()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
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
                        ◀
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
                            
                            {/* Line Selection */}
                            <div className="line-selector">
                                <label>Line</label>
                                <div className="line-pills">
                                    {[...new Set(availableLines.map(l => l.route_id))].map(routeId => {
                                        const route = railLines.features.find(f => f.properties.route_id === routeId);
                                        return (
                                            <button
                                                key={routeId}
                                                className={`line-pill ${selectedLine === routeId ? 'selected' : ''}`}
                                                style={{
                                                    backgroundColor: selectedLine === routeId ? route?.properties.color : 'transparent',
                                                    borderColor: route?.properties.color,
                                                    color: selectedLine === routeId ? 'white' : route?.properties.color
                                                }}
                                                onClick={() => {
                                                    onLineChange(routeId);
                                                    onDirectionChange('');
                                                }}
                                            >
                                                {route?.properties.name || routeId}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Direction Selection */}
                            {selectedLine && (
                                <DirectionSelector
                                    selectedLine={selectedLine}
                                    availableLines={availableLines}
                                    selectedDirection={selectedDirection}
                                    onDirectionChange={onDirectionChange}
                                />
                            )}

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
                                                    <div className="trip-stops-container">
                                                        <p className="upcoming-note">Upcoming stops</p>
                                                        <ul className="trip-stops">
                                                            {tripDetails
                                                                .filter(stop => stop.arrivalTime >= arrival.arrivalTime)
                                                                .map((stop, stopIdx) => {
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
                                                    </div>
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
                        <p>Search for or click a station on the map to see arrival times.</p>
                    )}
                </div>
            )}
            </div>
        </>
    );
}

export default TripPanel;
