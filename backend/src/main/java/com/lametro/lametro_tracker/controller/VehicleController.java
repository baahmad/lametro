package com.lametro.lametro_tracker.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
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
    public List<StopTimeUpdate> getStopTimeUpdates(){
        return gtfsRtService.getTripUpdates();
    }
}
