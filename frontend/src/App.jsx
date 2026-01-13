import { useState } from 'react';
import MapLegend from './components/MapLegend';
import MetroMap from './components/MetroMap';
import TripPanel from './components/TripPanel';
import useVehiclePositions from './hooks/useVehiclePositions';
import './App.css';

function App() {
  const { vehicles, error } = useVehiclePositions(15000);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="App">
      {error && <div className="error">Error: {error}</div>}
      <TripPanel 
        selectedStation={selectedStation} 
        onStationSelect={setSelectedStation}
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
