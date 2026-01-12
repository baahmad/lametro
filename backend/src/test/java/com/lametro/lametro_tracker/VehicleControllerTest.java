package com.lametro.lametro_tracker;

import static org.mockito.Mockito.when;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lametro.lametro_tracker.model.StopTimeUpdate;
import com.lametro.lametro_tracker.model.VehiclePosition;
import com.lametro.lametro_tracker.service.GtfsRtService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

import com.lametro.lametro_tracker.controller.VehicleController;


@WebMvcTest (VehicleController.class)
public class VehicleControllerTest {
    
    @Autowired 
    private MockMvc mockMvc;

    @MockitoBean
    private GtfsRtService gtfsRtService;

    @Test
    void getVehicles_returnsVehicleList() throws Exception {
        VehiclePosition vehicle = new VehiclePosition(
            "123", "801", "trip1", 0, 34.0, -118.0, 90.0f, 1234567890L
        );
        when(gtfsRtService.getVehiclePositions()).thenReturn(List.of(vehicle));

        // Act and assert.
        mockMvc.perform(get("/api/vehicles"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].vehicleId").value("123"))
            .andExpect(jsonPath("$[0].routeId").value("801"))
            .andExpect(jsonPath("$[0].tripId").value("trip1"))
            .andExpect(jsonPath("$[0].directionId").value(0))
            .andExpect(jsonPath("$[0].latitude").value(34.0))
            .andExpect(jsonPath("$[0].longitude").value(-118.0))
            .andExpect(jsonPath("$[0].bearing").value(90.0f))
            .andExpect(jsonPath("$[0].timestamp").value(1234567890L));
    }

    @Test
    void getTripUpdates_filtersByRouteId() throws Exception {
        List<StopTimeUpdate> updates = List.of(
            new StopTimeUpdate("trip1", "801", 0, "stop1", 1000L),
            new StopTimeUpdate("trip2", "802", 0, "stop2", 2000L),
            new StopTimeUpdate("trip3", "801", 1, "stop3", 3000L)
        );
        when(gtfsRtService.getTripUpdates()).thenReturn(updates);

        // Act and assert.
        mockMvc.perform(get("/api/trip-updates").param("routeId", "801"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].routeId").value("801"))
            .andExpect(jsonPath("$[1].routeId").value("801"));
    }

    @Test
    void getTripUpdates_filtersByDirectionId() throws Exception {
        List<StopTimeUpdate> updates = List.of(
            new StopTimeUpdate("trip1", "801", 0, "stop1", 1000L),
            new StopTimeUpdate("trip2", "801", 1, "stop2", 2000L),
            new StopTimeUpdate("trip3", "801", 0, "stop3", 3000L)
        );
        when(gtfsRtService.getTripUpdates()).thenReturn(updates);

        // Assert and act.
        mockMvc.perform(get("/api/trip-updates").param("directionId", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].directionId").value(1));
    }

    @Test
    void getTripUpdates_sortsByArrivalTimeAndLimitsToTwo() throws Exception {
        List<StopTimeUpdate> updates = List.of(
            new StopTimeUpdate("trip1", "801", 0, "stop1", 3000L),
            new StopTimeUpdate("trip2", "801", 0, "stop2", 1000L),
            new StopTimeUpdate("trip3", "801", 0, "stop3", 2000L)
        );
        when(gtfsRtService.getTripUpdates()).thenReturn(updates);

        // Assert and act.
        mockMvc.perform(get("/api/trip-updates"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].arrivalTime").value(1000L))
            .andExpect(jsonPath("$[1].arrivalTime").value(2000L));
    }

    @Test
    void getTripUpdates_returnsEmptyList() throws Exception {
        when(gtfsRtService.getTripUpdates()).thenReturn(List.of());

        // Act and assert.
        mockMvc.perform(get("/api/trip-updates"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());
    }

}
