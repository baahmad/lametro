import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useVehiclePositions from './useVehiclePositions'

describe('useVehiclePositions', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('fetches and returns vehicle positions', async () => {
        const mockVehicles = [
            { vehicleId: '123', routeId: '801', latitude: 34.0, longitude: -118.0 }
        ]
        
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockVehicles),
            })
        )

        const { result } = renderHook(() => useVehiclePositions())

        await waitFor(() => {
            expect(result.current.vehicles).toEqual(mockVehicles)
        })
        
        expect(result.current.error).toBeNull()
    })

    it('handles fetch errors', async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

        const { result } = renderHook(() => useVehiclePositions())

        await waitFor(() => {
            expect(result.current.error).toBe('Network error')
        })
    })
})
