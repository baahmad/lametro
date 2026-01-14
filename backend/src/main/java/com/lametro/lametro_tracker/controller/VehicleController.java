package com.lametro.lametro_tracker.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lametro.lametro_tracker.model.StopTimeUpdate;
import com.lametro.lametro_tracker.model.VehiclePosition;
import com.lametro.lametro_tracker.service.GtfsRtService;


@RestController
public class VehicleController {

    private final GtfsRtService gtfsRtService;

    public VehicleController(GtfsRtService gtfsRtService) {
        this.gtfsRtService = gtfsRtService;
    }
    
    @GetMapping("/api/vehicles")
    public List<VehiclePosition> getVehiclePositions(){
        return gtfsRtService.getVehiclePositions();
    }

    @GetMapping("/api/trip-updates")
    public List<StopTimeUpdate> getStopTimeUpdates(
        @RequestParam(required = false) String routeId,
        @RequestParam(required = false) Integer directionId,
        @RequestParam(required = false) String stopIds
    ){
        List<StopTimeUpdate> updates = gtfsRtService.getTripUpdates();

        // Parse comma-separated stop IDs into prefixes for matching.
        List<String> stopIdPrefixes = null;
        if (stopIds != null && !stopIds.isEmpty()) {
            stopIdPrefixes = Arrays.stream(stopIds.split(","))
                .map(id -> id.endsWith("S") ? id.substring(0, id.length() - 1) : id)
                .toList();
        }
        
        final List<String> prefixes = stopIdPrefixes;

        return updates.stream()
            .filter(u -> routeId == null || u.getRouteId().equals(routeId))
            .filter(u -> directionId == null || u.getDirectionId() == directionId)
            .filter(u -> prefixes == null || prefixes.stream().anyMatch(p -> u.getStopId().startsWith(p)))
            .sorted((a, b) -> Long.compare(a.getArrivalTime(), b.getArrivalTime()))
            .limit(2)
            .toList();
    }

    @GetMapping("/api/trip-details")
    public List<StopTimeUpdate> getTripDetails(@RequestParam String tripId) {
        List<StopTimeUpdate> updates = gtfsRtService.getTripUpdates();
        
        return updates.stream()
            .filter(u -> u.getTripId().equals(tripId))
            .sorted((a, b) -> Long.compare(a.getArrivalTime(), b.getArrivalTime()))
            .toList();
    }
}
