package com.lametro.lametro_tracker.model;

public class VehiclePosition {
    private String vehicleId;
    private String routeId;
    private String tripId;
    private int directionId;
    private double latitude;
    private double longitude;
    private float bearing;
    private long timestamp;

    public VehiclePosition () {}

    public VehiclePosition(String vehicleId, String routeId, String tripId, int directionId, double latitude, double longitude, float bearing, long timestamp) {
        this.vehicleId = vehicleId;
        this.routeId = routeId;
        this.tripId = tripId;
        this.directionId = directionId;
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
    public void setTripId(String tripId) {
        this.tripId = tripId;
    }
    public void setDirectionId(int directionId) {
        this.directionId = directionId;
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
    public String getTripId() {
        return tripId;
    }
    public int getDirectionId() {
        return directionId;
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
