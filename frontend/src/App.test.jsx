import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import App from './App'

// Mock the child components to isolate App logic.
vi.mock('./components/MetroMap', () => ({
    default: () => <div data-testid="metro-map" />
}))

vi.mock('./components/MapLegend', () => ({
    default: () => <div data-testid="map-legend" />
}))

vi.mock('./components/TripPanel', () => ({
    default: ({ selectedStation, selectedLine, selectedDirection }) => (
        <div data-testid="trip-panel">
            <span data-testid="station">{selectedStation?.stop_id || ''}</span>
            <span data-testid="line">{selectedLine}</span>
            <span data-testid="direction">{selectedDirection}</span>
        </div>
    )
}))

vi.mock('./hooks/useVehiclePositions', () => ({
    default: () => ({ vehicles: [], error: null })
}))

vi.mock('./data/railLines.json', () => ({
    default: {
        stations: [
            { stop_id: '80122', name: '7th Street/Metro Center', stopIds: ['80122'] },
            { stop_id: '80121', name: 'Civic Center', stopIds: ['80121'] }
        ],
        stationLines: {},
        features: []
    }
}))

describe('App URL parameter handling', () => {
    let originalLocation

    beforeEach(() => {
        // Save original location.
        originalLocation = window.location
    })

    afterEach(() => {
        // Restore original location.
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true
        })
    })

    const setUrlParams = (params) => {
        const url = new URL('http://localhost')
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value)
        })
        Object.defineProperty(window, 'location', {
            value: {
                ...originalLocation,
                search: url.search,
                pathname: '/',
                href: url.href
            },
            writable: true
        })
    }

    it('Preserves station, line, and direction from URL on initial load', async () => {
        setUrlParams({
            station: '80122',
            line: '801',
            direction: '0'
        })

        const { getByTestId } = render(<App />)

        // Wait for initialization to complete.
        await waitFor(() => {
            expect(getByTestId('station').textContent).toBe('80122')
        })

        // Line and direction should also be preserved.
        expect(getByTestId('line').textContent).toBe('801')
        expect(getByTestId('direction').textContent).toBe('0')
    })

    it('Handles URL with only station parameter', async () => {
        setUrlParams({
            station: '80122'
        })

        const { getByTestId } = render(<App />)

        await waitFor(() => {
            expect(getByTestId('station').textContent).toBe('80122')
        })

        // Line and direction should be empty.
        expect(getByTestId('line').textContent).toBe('')
        expect(getByTestId('direction').textContent).toBe('')
    })

    it('Handles URL with no parameters', async () => {
        // No URL params set.
        Object.defineProperty(window, 'location', {
            value: {
                ...originalLocation,
                search: '',
                pathname: '/',
                href: 'http://localhost/'
            },
            writable: true
        })

        const { getByTestId } = render(<App />)

        // All should be empty.
        expect(getByTestId('station').textContent).toBe('')
        expect(getByTestId('line').textContent).toBe('')
        expect(getByTestId('direction').textContent).toBe('')
    })

    it('Handles invalid station ID in URL gracefully', async () => {
        setUrlParams({
            station: 'invalid-station',
            line: '801',
            direction: '0'
        })

        const { getByTestId } = render(<App />)

        // Station not found, so all should remain empty.
        expect(getByTestId('station').textContent).toBe('')
        expect(getByTestId('line').textContent).toBe('')
        expect(getByTestId('direction').textContent).toBe('')
    })
})

describe('Outage banner', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('Shows banner when config has banner enabled', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            json: () => Promise.resolve({
                banner: { enabled: true, message: 'System outage in progress.' }
            })
        })

        const { getByText } = render(<App />)

        await waitFor(() => {
            expect(getByText('System outage in progress.')).toBeTruthy()
        })
    })

    it('Hides banner when config has banner disabled', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            json: () => Promise.resolve({
                banner: { enabled: false, message: 'System outage in progress.' }
            })
        })

        const { queryByText } = render(<App />)

        await waitFor(() => {
            expect(queryByText('System outage in progress.')).toBeNull()
        })
    })

    it('Hides banner when config fetch fails', async () => {
        vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

        const { container } = render(<App />)

        await waitFor(() => {
            expect(container.querySelector('.outage-banner')).toBeNull()
        })
    })
})
