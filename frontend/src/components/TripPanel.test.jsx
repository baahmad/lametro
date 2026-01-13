import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TripPanel from './TripPanel'

// Mock the railLines data.
vi.mock('../data/railLines.json', () => ({
    default: {
        stations: [
            { stop_id: '1', name: 'Union Station' },
            { stop_id: '2', name: '7th Street/Metro Center' },
            { stop_id: '3', name: 'Wilshire/Vermont' }
        ],
        stationLines: {},
        features: []
    }
}))

describe('TripPanel', () => {
    it('Filters stations based on search query', () => {
        const onStationSelect = vi.fn()
        render(<TripPanel selectedStation={null} onStationSelect={onStationSelect} />)
        
        // Open the panel.
        fireEvent.click(screen.getByText('▶'))
        
        // Type in search.
        const searchInput = screen.getByPlaceholderText('Search stations...')
        fireEvent.focus(searchInput)
        fireEvent.change(searchInput, { target: { value: 'Union' } })
        
        // Should show Union Station.
        expect(screen.getByText('Union Station')).toBeInTheDocument()
        // Should not show others.
        expect(screen.queryByText('7th Street/Metro Center')).not.toBeInTheDocument()
    })

    it('calls onStationSelect when a station is clicked', () => {
        const onStationSelect = vi.fn()
        render(<TripPanel selectedStation={null} onStationSelect={onStationSelect} />)
        
        // Open panel and search.
        fireEvent.click(screen.getByText('▶'))
        const searchInput = screen.getByPlaceholderText('Search stations...')
        fireEvent.focus(searchInput)
        fireEvent.change(searchInput, { target: { value: 'Union' } })
        
        // Click the result.
        fireEvent.click(screen.getByText('Union Station'))
        
        expect(onStationSelect).toHaveBeenCalledWith({ stop_id: '1', name: 'Union Station' })
    })

    it('Clears search after selecting a station', () => {
        const onStationSelect = vi.fn()
        render(<TripPanel selectedStation={null} onStationSelect={onStationSelect} />)
        
        // Open panel and search.
        fireEvent.click(screen.getByText('▶'))
        const searchInput = screen.getByPlaceholderText('Search stations...')
        fireEvent.focus(searchInput)
        fireEvent.change(searchInput, { target: { value: 'Union' } })
        
        // Click the result.
        fireEvent.click(screen.getByText('Union Station'))
        
        // Search should be cleared.
        expect(searchInput.value).toBe('')
    })

    it('Displays station name when station is selected', () => {
        const onStationSelect = vi.fn()
        render(<TripPanel
            selectedStation={{ stop_id: '80122S', name: '7th Street/Metro Center', stopIds: ['80122'] }}
            onStationSelect={onStationSelect}
        />)

        // Panel should auto-open and show station name
        expect(screen.getByText('7th Street/Metro Center')).toBeInTheDocument()
        expect(screen.getByText('Line & Direction')).toBeInTheDocument()
    })
})
