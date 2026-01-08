import MetroMap from './components/MetroMap';
import TripPanel from './components/TripPanel';
import useVehiclePositions from './hooks/useVehiclePositions';
import './App.css';

function App() {
  const { vehicles, error } = useVehiclePositions(10000); // Poll every 10 seconds

  return (
    <div className="App">
      {error && <div className="error">Error: {error}</div>}
      <TripPanel />
      <MetroMap vehicles={vehicles} />
    </div>
  );
}

export default App;
