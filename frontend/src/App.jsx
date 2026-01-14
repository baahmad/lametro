import { useState, useEffect } from 'react';
import MapLegend from './components/MapLegend';
import MetroMap from './components/MetroMap';
import TripPanel from './components/TripPanel';
import useVehiclePositions from './hooks/useVehiclePositions';
import railLines from './data/railLines.json';
import './App.css';

/**
 * Root application component for the LA Metro Tracker.
 * Manages global state for station/line/direction selection and URL synchronization.
 */
function App() {
  const { vehicles, error } = useVehiclePositions(15000);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Read URL params on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stationId = params.get('station');
    const line = params.get('line');
    const direction = params.get('direction');

    if (stationId) {
      const station = railLines.stations.find(s => s.stop_id === stationId);
      if (station) {
        setSelectedStation(station);
        setIsPanelOpen(true);
        if (line) setSelectedLine(line);
        if (direction) setSelectedDirection(direction);
      }
    }
  }, []);

  // Update URL when state changes.
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedStation) {
      params.set('station', selectedStation.stop_id);
      if (selectedLine) params.set('line', selectedLine);
      if (selectedDirection) params.set('direction', selectedDirection);
    }
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [selectedStation, selectedLine, selectedDirection]);

  return (
    <div className="App">
      {error && <div className="error">Error: {error}</div>}
      <TripPanel 
        selectedStation={selectedStation} 
        onStationSelect={setSelectedStation}
        selectedLine={selectedLine}
        onLineChange={setSelectedLine}
        selectedDirection={selectedDirection}
        onDirectionChange={setSelectedDirection}
        isOpen={isPanelOpen}
        setIsOpen={setIsPanelOpen}
      />
      <MetroMap 
        vehicles={vehicles} 
        onStationClick={(station) => {
          setSelectedStation(station);
          setIsPanelOpen(true);
        }} 
        isPanelOpen={isPanelOpen} 
      />
      <MapLegend isPanelOpen={isPanelOpen} />
    </div>
  );
}

export default App;
