package com.rejili.eimp.controller;

import com.rejili.eimp.dto.IncidentRequest;
import com.rejili.eimp.entity.Incident;
import com.rejili.eimp.entity.IncidentStatus;
import com.rejili.eimp.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {

        return ResponseEntity.ok(
                incidentService.getAllIncidents()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                incidentService.getIncidentById(id)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Incident>> getIncidentsByStatus(
            @PathVariable IncidentStatus status) {

        return ResponseEntity.ok(
                incidentService.getIncidentsByStatus(status)
        );
    }

    @GetMapping("/assigned/{userId}")
    public ResponseEntity<List<Incident>> getAssignedIncidents(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                incidentService.getIncidentsAssignedToUser(userId)
        );
    }

    @GetMapping("/vms/{virtualMachineId}")
    public ResponseEntity<List<Incident>> getIncidentsByVirtualMachine(
            @PathVariable Long virtualMachineId) {

        return ResponseEntity.ok(
                incidentService.getIncidentsByVirtualMachine(
                        virtualMachineId
                )
        );
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(
            @Valid @RequestBody IncidentRequest request,
            @RequestParam Long createdByUserId) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        incidentService.createIncident(
                                request,
                                createdByUserId
                        )
                );
    }

    @PutMapping("/{id}/assign/{userId}")
    public ResponseEntity<Incident> assignIncident(
            @PathVariable Long id,
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                incidentService.assignIncident(id, userId)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(
            @PathVariable Long id,
            @RequestParam IncidentStatus status) {

        return ResponseEntity.ok(
                incidentService.updateStatus(id, status)
        );
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Incident> resolveIncident(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                incidentService.resolveIncident(id)
        );
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Incident> closeIncident(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                incidentService.closeIncident(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(
            @PathVariable Long id) {

        incidentService.deleteIncident(id);

        return ResponseEntity.noContent().build();
    }
}