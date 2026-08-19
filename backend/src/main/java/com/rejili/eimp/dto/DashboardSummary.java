package com.rejili.eimp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardSummary {

    private long totalAssets;
    private long activeAssets;
    private long inactiveAssets;

    private long totalVirtualMachines;
    private long runningVirtualMachines;
    private long stoppedVirtualMachines;
    private long pausedVirtualMachines;

    private long activeAlerts;
    private long criticalAlerts;
    private long warningAlerts;

    private long openIncidents;
    private long assignedIncidents;
    private long inProgressIncidents;
    private long resolvedIncidents;
    private long closedIncidents;
}