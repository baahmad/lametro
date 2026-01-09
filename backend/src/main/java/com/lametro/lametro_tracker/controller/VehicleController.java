package com.lametro.lametro_tracker.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lametro.lametro_tracker.model.StopTimeUpdate;
import com.lametro.lametro_tracker.model.VehiclePosition;
import com.lametro.lametro_tracker.service.GtfsRtService;


@RestController
public class VehicleController {

    private GtfsRtService gtfsRtService;
    public VehicleController(GtfsRtService gtfsRtService){
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
         @RequestParam(required = false) String stopId
    ){
        List<StopTimeUpdate> updates = gtfsRtService.getTripUpdates();

        String stopIdPrefix = stopId != null && stopId.endsWith("S") 
            ? stopId.substring(0, stopId.length() - 1) 
            : stopId;

        return updates.stream()
            .filter(u -> routeId == null || u.getRouteId().equals(routeId))
            .filter(u -> directionId == null || u.getDirectionId() == directionId)
            .filter(u -> stopId == null || u.getStopId().startsWith(stopIdPrefix))
            .sorted((a, b) -> Long.compare(a.getArrivalTime(), b.getArrivalTime()))
            .limit(2)
            .toList();
    }
}
