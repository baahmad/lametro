package com.lametro.lametro_tracker.service;

import java.net.HttpURLConnection;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.io.InputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.transit.realtime.GtfsRealtime.FeedEntity;
import com.google.transit.realtime.GtfsRealtime.FeedMessage;
import com.lametro.lametro_tracker.model.StopTimeUpdate;
import com.lametro.lametro_tracker.model.VehiclePosition;

@Service
public class GtfsRtService {

    private static final Logger log = LoggerFactory.getLogger(GtfsRtService.class);

    @Value("${lametro.api.key}")
    private String apiKey;

    private static final long CACHE_TTL_MS = 15_000;
    private List<VehiclePosition> vehiclePositionsCache = new ArrayList<>();
    private long vehiclePositionsCacheTime = 0;
    private List<StopTimeUpdate> tripUpdatesCache = new ArrayList<>();
    private long tripUpdatesCacheTime = 0;

    public List<VehiclePosition> getVehiclePositions(){
        long now = System.currentTimeMillis();
        if (now - vehiclePositionsCacheTime < CACHE_TTL_MS && !vehiclePositionsCache.isEmpty()) {
            return vehiclePositionsCache;
        }
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

                // Update cache.
                vehiclePositionsCache = positions;
                vehiclePositionsCacheTime = now;
            }
        } catch (Exception e) {
            log.error("Error fetching GTFS-RT vehicle positions", e);
            if (!vehiclePositionsCache.isEmpty()) {
                return vehiclePositionsCache;
            }
        }
        return positions;
    }

    public List<StopTimeUpdate> getTripUpdates() {
        long now = System.currentTimeMillis();
        if (now - tripUpdatesCacheTime < CACHE_TTL_MS && !tripUpdatesCache.isEmpty()) {
            return tripUpdatesCache;
        }
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

                // Update cache.
                tripUpdatesCache = updates;
                tripUpdatesCacheTime = now;
            }
        } catch (Exception e) {
            log.error("Error fetching GTFS-RT trip updates", e);
            if (!tripUpdatesCache.isEmpty()) {
                return tripUpdatesCache;
            }
        }
        return updates;
    }
}
