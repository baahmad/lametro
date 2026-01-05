package com.lametro.lametro_tracker.model;

public class VehiclePosition {
    private String vehicleId;
    private String routeId;
    private double latitude;
    private double longitude;
    private float bearing;
    private long timestamp;

    public VehiclePosition () {}

    public VehiclePosition(String vehicleId, String routeId, double latitude, double longitude, float bearing, long timestamp) {
        this.vehicleId = vehicleId;
        this.routeId = routeId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.bearing = bearing;
        this.timestamp = timestamp;
    }

    public void setVehicleId(String vehicleId){
        this.vehicleId = vehicleId;
    }
    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }
    public void setLatitude(double latitude){
        this.latitude = latitude;
    }
    public void setLongitude(double longitude){
        this.longitude = longitude;
    }
    public void setBearing(float bearing){
        this.bearing = bearing;
    }
    public void setTimestamp(long timestamp){
        this.timestamp = timestamp;
    }
    public String getVehicleId(){
        return vehicleId;
    }
    public String getRouteId(){
        return routeId;
    }
    public double getLatitude(){
        return latitude;
    }
    public double getLongitude(){
        return longitude;
    }
    public float getBearing(){
        return bearing;
    }
    public long getTimestamp(){
        return timestamp;
    }
}
