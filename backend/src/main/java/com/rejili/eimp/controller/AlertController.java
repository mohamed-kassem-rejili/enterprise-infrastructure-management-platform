package com.rejili.eimp.controller;

import com.rejili.eimp.entity.Alert;
import com.rejili.eimp.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping("/vms/{virtualMachineId}")
    public ResponseEntity<List<Alert>> getAlertsByVirtualMachine(
            @PathVariable Long virtualMachineId) {

        return ResponseEntity.ok(
                alertService.getAlertsByVirtualMachine(
                        virtualMachineId
                )
        );
    }

    @GetMapping("/vms/{virtualMachineId}/active")
    public ResponseEntity<List<Alert>> getActiveAlerts(
            @PathVariable Long virtualMachineId) {

        return ResponseEntity.ok(
                alertService.getActiveAlertsByVirtualMachine(
                        virtualMachineId
                )
        );
    }

    @PutMapping("/{alertId}/resolve")
    public ResponseEntity<Alert> resolveAlert(
            @PathVariable Long alertId) {

        return ResponseEntity.ok(
                alertService.resolveAlert(alertId)
        );
    }
}