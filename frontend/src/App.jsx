import { useState } from 'react';
import MapLegend from './components/MapLegend';
import MetroMap from './components/MetroMap';
import TripPanel from './components/TripPanel';
import useVehiclePositions from './hooks/useVehiclePositions';
import './App.css';

function App() {
  const { vehicles, error } = useVehiclePositions(10000); // Poll every 10 seconds.
  const [selectedStation, setSelectedStation] = useState(null);

  return (
    <div className="App">
      {error && <div className="error">Error: {error}</div>}
      <TripPanel selectedStation={selectedStation}/>
      <MetroMap vehicles={vehicles} onStationClick={setSelectedStation} />
      <MapLegend/>
    </div>
  );
}

export default App;
