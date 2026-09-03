export const API_BASE_URL = import.meta.env.PROD
    ? 'https://api.lametrotrains.com'
    : 'http://localhost:8080';

// CARTO basemap API key. Get a free key at https://carto.com/basemaps/apikey/
// Set locally in frontend/.env.local and in CI as the VITE_CARTO_API_KEY secret.
export const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;