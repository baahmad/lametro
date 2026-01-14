import { useState, useEffect, useRef } from 'react';
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

    // Swipe handling for mobile
    const touchStartX = useRef(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const panelWidth = typeof window !== 'undefined' && window.innerWidth <= 768
        ? window.innerWidth
        : 320;

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (touchStartX.current === null) return;

        const currentX = e.touches[0].clientX;
        const delta = currentX - touchStartX.current;

        if (isOpen) {
            // When open, only allow dragging left (negative delta) to close
            const newOffset = Math.min(0, delta);
            setDragOffset(newOffset);
        } else {
            // When closed, only allow dragging right (positive delta) to open
            // Clamp to panel width
            const newOffset = Math.max(0, Math.min(delta, panelWidth));
            setDragOffset(newOffset);
        }
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null) return;

        const threshold = panelWidth * 0.3; // 30% of panel width to trigger

        if (isOpen) {
            // If dragged left more than threshold, close
            if (dragOffset < -threshold) {
                setIsOpen(false);
            }
        } else {
            // If dragged right more than threshold, open
            if (dragOffset > threshold) {
                setIsOpen(true);
            }
        }

        // Reset
        touchStartX.current = null;
        setDragOffset(0);
        setIsDragging(false);
    };

    // Calculate panel transform based on drag state (mobile only)
    const getPanelStyle = () => {
        if (!isDragging || typeof window === 'undefined' || window.innerWidth > 768) return {};

        if (isOpen) {
            // Panel is open (at translateX(0)), dragging left to close
            return { transform: `translateX(${dragOffset}px)` };
        } else {
            // Panel is closed (at translateX(-100%)), dragging right to open
            return { transform: `translateX(calc(-100% + ${dragOffset}px))` };
        }
    };

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
                            {selectedLine && (() => {
                                const route = railLines.features.find(f => f.properties.route_id === selectedLine);
                                const directionType = route?.properties.directionType || 'north-south';
                                const invert = route?.properties.invertDirections;

                                // Sort directions so Northbound/Eastbound (effectiveDirection=0) comes first
                                const sortedLines = availableLines
                                    .filter(l => l.route_id === selectedLine)
                                    .sort((a, b) => {
                                        const effA = invert ? (1 - a.direction_id) : a.direction_id;
                                        const effB = invert ? (1 - b.direction_id) : b.direction_id;
                                        return effA - effB;
                                    });

                                return (
                                    <div className="direction-selector">
                                        <label>Direction</label>
                                        <div className="direction-toggle">
                                            {sortedLines.map(line => {
                                                const effectiveDirection = invert ? (1 - line.direction_id) : line.direction_id;
                                                const directionLabel = directionType === 'north-south'
                                                    ? (effectiveDirection === 1 ? 'Southbound' : 'Northbound')
                                                    : (effectiveDirection === 1 ? 'Westbound' : 'Eastbound');
                                                return (
                                                    <button
                                                        key={line.direction_id}
                                                        className={`direction-btn ${selectedDirection === String(line.direction_id) ? 'selected' : ''}`}
                                                        onClick={() => onDirectionChange(String(line.direction_id))}
                                                    >
                                                        {directionLabel}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

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
