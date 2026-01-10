package com.lametro.lametro_tracker.service;

import java.net.HttpURLConnection;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.transit.realtime.GtfsRealtime.FeedEntity;
import com.google.transit.realtime.GtfsRealtime.FeedMessage;
import com.lametro.lametro_tracker.model.StopTimeUpdate;
import com.lametro.lametro_tracker.model.VehiclePosition;

@Service
public class GtfsRtService {

    @Value("${lametro.api.key}")
    private String apiKey;
    
    public List<VehiclePosition> getVehiclePositions(){
        List<VehiclePosition> positions = new ArrayList<>();
        try {
            URI uri = new URI("https://api.goswift.ly/real-time/lametro-rail/gtfs-rt-vehicle-positions");
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestProperty("Authorization", apiKey);
            try (InputStream inputStream = conn.getInputStream()){
                FeedMessage feed = FeedMessage.parseFrom(inputStream);
                for (FeedEntity entity: feed.getEntityList()) {
                    if (entity.hasVehicle()) {
                        var vehicle = entity.getVehicle();
                        String vehicleId = vehicle.getVehicle().getId();
                        String routeId = vehicle.getTrip().getRouteId();
                        String tripId = vehicle.getTrip().getTripId();
                        int directionId = vehicle.getTrip().getDirectionId();
                        double latitude = vehicle.getPosition().getLatitude();
                        double longitude = vehicle.getPosition().getLongitude();
                        float bearing = vehicle.getPosition().getBearing();
                        long timestamp = vehicle.getTimestamp();

                        VehiclePosition pos = new VehiclePosition(
                            vehicleId, routeId, tripId, directionId, latitude, longitude, bearing, timestamp
                        );

                        positions.add(pos);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching GTFS-RT data: " + e.getMessage());
        }

        return positions;
    }

    public List<StopTimeUpdate> getTripUpdates() {
        List<StopTimeUpdate> updates = new ArrayList<>();
        try {
            URI uri = new URI("https://api.goswift.ly/real-time/lametro-rail/gtfs-rt-trip-updates");
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestProperty("Authorization", apiKey);
            try (InputStream inputStream = conn.getInputStream()) {
                FeedMessage feed = FeedMessage.parseFrom(inputStream);
                for (FeedEntity entity : feed.getEntityList()) {
                    if (entity.hasTripUpdate()) {
                        var tripUpdate = entity.getTripUpdate();
                        String tripId = tripUpdate.getTrip().getTripId();
                        String routeId = tripUpdate.getTrip().getRouteId();
                        int directionId = tripUpdate.getTrip().getDirectionId();

                        for (var stopTimeUpdate : tripUpdate.getStopTimeUpdateList()) {
                            String stopId = stopTimeUpdate.getStopId();
                            if (stopTimeUpdate.hasArrival()) {
                                long arrivalTime = stopTimeUpdate.getArrival().getTime();
                                updates.add(new StopTimeUpdate(tripId, routeId, directionId, stopId, arrivalTime));
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching GTFS-RT trip updates: " + e.getMessage());
        }
        return updates;
    }
}
