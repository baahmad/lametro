package com.lametro.lametro_tracker.service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.io.InputStream;
import org.springframework.stereotype.Service;

import com.google.transit.realtime.GtfsRealtime.FeedEntity;
import com.google.transit.realtime.GtfsRealtime.FeedMessage;
import com.lametro.lametro_tracker.model.VehiclePosition;

@Service
public class GtfsRtService {
    
    public List<VehiclePosition> getVehiclePositions(){
        List<VehiclePosition> positions = new ArrayList<>();
        try {
            URI uri = new URI("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs");
            try (InputStream inputStream = uri.toURL().openStream()){
                FeedMessage feed = FeedMessage.parseFrom(inputStream);
                for (FeedEntity entity: feed.getEntityList()) {
                    if (entity.hasVehicle()) {
                        var vehicle = entity.getVehicle();
                        String vehicleId = vehicle.getVehicle().getId();
                        String routeId = vehicle.getTrip().getRouteId();
                        double latitude = vehicle.getPosition().getLatitude();
                        double longitude = vehicle.getPosition().getLongitude();
                        float bearing = vehicle.getPosition().getBearing();
                        long timestamp = vehicle.getTimestamp();

                        VehiclePosition pos = new VehiclePosition(
                            vehicleId, routeId, latitude, longitude, bearing, timestamp
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
}
