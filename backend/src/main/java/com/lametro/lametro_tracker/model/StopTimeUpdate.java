package com.lametro.lametro_tracker.model;

public class StopTimeUpdate {
    private String tripId;
    private String routeId;
    private int directionId;
    private String stopId;
    private long arrivalTime;

    public StopTimeUpdate(String tripId, String routeId, int directionId, String stopId, long arrivalTime) {
        this.tripId = tripId;
        this.routeId = routeId;
        this.directionId = directionId;
        this.stopId = stopId;
        this.arrivalTime = arrivalTime;
    }

    public String getTripId(){
        return tripId;
    }
    public String getRouteId(){
        return routeId;
    }
    public int getDirectionId(){
        return directionId;
    }
    public String getStopId() {
        return stopId;
    }
    public long getArrivalTime(){
        return arrivalTime;
    }

}
