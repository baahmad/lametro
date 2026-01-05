import MetroMap from './components/MetroMap';
import './App.css';

function App() {
  // Hardcoded test data for now
  const testVehicles = [
    { vehicleId: '1', latitude: 40.7128, longitude: -74.006, routeId: '1' },
    { vehicleId: '2', latitude: 40.7580, longitude: -73.9855, routeId: '2' },
  ];

  return (
    <div className="App">
      <MetroMap vehicles={testVehicles} />
    </div>
  );
}

export default App;
