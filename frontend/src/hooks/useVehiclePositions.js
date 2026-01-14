import { useState, useEffect } from 'react';

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/vehicles`;

/**
 * Custom hook for fetching and polling vehicle positions from the API.
 * @param {number} pollInterval - Polling interval in milliseconds (default: 15000).
 * @returns {object} Object containing vehicles array and error state.
 */
function useVehiclePositions(pollInterval = 15000) {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setVehicles(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching vehicles:', err);
      }
    };

    // Fetch immediately.
    fetchVehicles();

    // Then fetch every pollInterval ms.
    const interval = setInterval(fetchVehicles, pollInterval);

    // Cleanup on unmount.
    return () => clearInterval(interval);
  }, [pollInterval]);

  return { vehicles, error };
}

export default useVehiclePositions;
