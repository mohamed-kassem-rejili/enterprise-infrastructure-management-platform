package com.rejili.eimp.service;

import com.rejili.eimp.dto.DashboardSummary;
import com.rejili.eimp.entity.Alert;
import com.rejili.eimp.entity.AlertSeverity;
import com.rejili.eimp.entity.AlertStatus;
import com.rejili.eimp.entity.IncidentStatus;
import com.rejili.eimp.entity.VirtualMachine;
import com.rejili.eimp.repository.AlertRepository;
import com.rejili.eimp.repository.AssetRepository;
import com.rejili.eimp.repository.IncidentRepository;
import com.rejili.eimp.repository.VirtualMachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AssetRepository assetRepository;
    private final VirtualMachineRepository virtualMachineRepository;
    private final AlertRepository alertRepository;
    private final IncidentRepository incidentRepository;

    public DashboardSummary getSummary() {

        var assets = assetRepository.findAll();
        var virtualMachines = virtualMachineRepository.findAll();
        var alerts = alertRepository.findAll();

        long totalAssets = assets.size();

        long activeAssets = assets.stream()
                .filter(asset ->
                        asset.getStatus() != null &&
                        "ACTIVE".equalsIgnoreCase(
                                asset.getStatus().toString()
                        )
                )
                .count();

        long inactiveAssets =
                totalAssets - activeAssets;

        long totalVirtualMachines =
                virtualMachines.size();

        long runningVirtualMachines =
                virtualMachines.stream()
                        .filter(vm ->
                                vm.getStatus() ==
                                        VirtualMachine.VmStatus.RUNNING
                        )
                        .count();

        long stoppedVirtualMachines =
                virtualMachines.stream()
                        .filter(vm ->
                                vm.getStatus() ==
                                        VirtualMachine.VmStatus.STOPPED
                        )
                        .count();

        long pausedVirtualMachines =
                virtualMachines.stream()
                        .filter(vm ->
                                vm.getStatus() ==
                                        VirtualMachine.VmStatus.PAUSED
                        )
                        .count();

        long activeAlerts = alerts.stream()
                .filter(alert ->
                        alert.getStatus() ==
                                AlertStatus.ACTIVE
                )
                .count();

        long criticalAlerts = alerts.stream()
                .filter(alert ->
                        alert.getStatus() ==
                                AlertStatus.ACTIVE
                                &&
                        alert.getSeverity() ==
                                AlertSeverity.CRITICAL
                )
                .count();

        long warningAlerts = alerts.stream()
                .filter(alert ->
                        alert.getStatus() ==
                                AlertStatus.ACTIVE
                                &&
                        alert.getSeverity() ==
                                AlertSeverity.WARNING
                )
                .count();

        long openIncidents =
                incidentRepository
                        .findByStatusOrderByCreatedAtDesc(
                                IncidentStatus.OPEN
                        )
                        .size();

        long assignedIncidents =
                incidentRepository
                        .findByStatusOrderByCreatedAtDesc(
                                IncidentStatus.ASSIGNED
                        )
                        .size();

        long inProgressIncidents =
                incidentRepository
                        .findByStatusOrderByCreatedAtDesc(
                                IncidentStatus.IN_PROGRESS
                        )
                        .size();

        long resolvedIncidents =
                incidentRepository
                        .findByStatusOrderByCreatedAtDesc(
                                IncidentStatus.RESOLVED
                        )
                        .size();

        long closedIncidents =
                incidentRepository
                        .findByStatusOrderByCreatedAtDesc(
                                IncidentStatus.CLOSED
                        )
                        .size();

        return new DashboardSummary(
                totalAssets,
                activeAssets,
                inactiveAssets,
                totalVirtualMachines,
                runningVirtualMachines,
                stoppedVirtualMachines,
                pausedVirtualMachines,
                activeAlerts,
                criticalAlerts,
                warningAlerts,
                openIncidents,
                assignedIncidents,
                inProgressIncidents,
                resolvedIncidents,
                closedIncidents
        );
    }
}