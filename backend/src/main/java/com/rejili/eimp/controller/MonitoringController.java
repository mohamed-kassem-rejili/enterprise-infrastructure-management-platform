package com.rejili.eimp.controller;

import com.rejili.eimp.entity.MonitoringMetric;
import com.rejili.eimp.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/monitoring")
@RequiredArgsConstructor
public class MonitoringController {

    private final MonitoringService monitoringService;

    @GetMapping("/vms/{virtualMachineId}")
    public ResponseEntity<List<MonitoringMetric>> getMetrics(
            @PathVariable Long virtualMachineId) {

        return ResponseEntity.ok(
                monitoringService.getMetricsByVirtualMachine(
                        virtualMachineId
                )
        );
    }

    @GetMapping("/vms/{virtualMachineId}/range")
    public ResponseEntity<List<MonitoringMetric>> getMetricsByPeriod(
            @PathVariable Long virtualMachineId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime start,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime end) {

        return ResponseEntity.ok(
                monitoringService.getMetricsByVirtualMachineAndPeriod(
                        virtualMachineId,
                        start,
                        end
                )
        );
    }

    @PostMapping("/vms/{virtualMachineId}")
    public ResponseEntity<MonitoringMetric> createMetric(
            @PathVariable Long virtualMachineId,
            @RequestBody MonitoringMetric metric) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        monitoringService.createMetric(
                                virtualMachineId,
                                metric
                        )
                );
    }
}