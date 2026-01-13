import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

const defaultProps = {
    selectedStation: null,
    onStationSelect: vi.fn(),
    selectedLine: '',
    onLineChange: vi.fn(),
    selectedDirection: '',
    onDirectionChange: vi.fn(),
    isOpen: true,
    setIsOpen: vi.fn()
}

describe('TripPanel', () => {
    it('Filters stations based on search query', () => {
        const onStationSelect = vi.fn()
        const setIsOpen = vi.fn()
        render(<TripPanel
            {...defaultProps}
            onStationSelect={onStationSelect}
            setIsOpen={setIsOpen}
        />)
        
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
        const setIsOpen = vi.fn()
        render(<TripPanel
            {...defaultProps}
            onStationSelect={onStationSelect}
            setIsOpen={setIsOpen}
        />)
        
        // Search for station.
        const searchInput = screen.getByPlaceholderText('Search stations...')
        fireEvent.focus(searchInput)
        fireEvent.change(searchInput, { target: { value: 'Union' } })
        
        // Click the result.
        fireEvent.click(screen.getByText('Union Station'))
        
        expect(onStationSelect).toHaveBeenCalledWith({ stop_id: '1', name: 'Union Station' })
    })

    it('Clears search after selecting a station', () => {
        const onStationSelect = vi.fn()
        const setIsOpen = vi.fn()
        render(<TripPanel
            {...defaultProps}
            onStationSelect={onStationSelect}
            setIsOpen={setIsOpen}
        />)
        
        // Search for station.
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
        const setIsOpen = vi.fn()
        const onLineChange = vi.fn()
        const onDirectionChange = vi.fn()
        render(<TripPanel
            {...defaultProps}
            selectedStation={{ stop_id: '80122S', name: '7th Street/Metro Center', stopIds: ['80122'] }}
            onStationSelect={onStationSelect}
            onLineChange={onLineChange}
            onDirectionChange={onDirectionChange}
            setIsOpen={setIsOpen}
        />)

        // Panel should show station name.
        expect(screen.getByText('7th Street/Metro Center')).toBeInTheDocument()
    })

    it('calls setIsOpen(false) when close button is clicked', () => {
        const setIsOpen = vi.fn()
        const { container } = render(<TripPanel
            {...defaultProps}
            setIsOpen={setIsOpen}
        />)

        // Click close button (has class "close-btn").
        const closeBtn = container.querySelector('.close-btn')
        fireEvent.click(closeBtn)

        expect(setIsOpen).toHaveBeenCalledWith(false)
    })

    it('calls setIsOpen when toggle button is clicked', () => {
        const setIsOpen = vi.fn()
        render(<TripPanel
            {...defaultProps}
            isOpen={false}
            setIsOpen={setIsOpen}
        />)

        // Click toggle button to open.
        fireEvent.click(screen.getByText('▶'))

        expect(setIsOpen).toHaveBeenCalledWith(true)
    })

    it('Does not render panel content when closed', () => {
        const setIsOpen = vi.fn()
        render(<TripPanel
            {...defaultProps}
            isOpen={false}
            setIsOpen={setIsOpen}
        />)

        // Search input should not be visible when panel is closed
        expect(screen.queryByPlaceholderText('Search stations...')).not.toBeInTheDocument()
    })
})
