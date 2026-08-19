package com.rejili.eimp.service;

import com.rejili.eimp.entity.Alert;
import com.rejili.eimp.entity.AlertSeverity;
import com.rejili.eimp.entity.AlertStatus;
import com.rejili.eimp.entity.AlertType;
import com.rejili.eimp.entity.AuditAction;
import com.rejili.eimp.entity.MonitoringMetric;
import com.rejili.eimp.entity.VirtualMachine;
import com.rejili.eimp.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private static final double WARNING_THRESHOLD = 80.0;
    private static final double CRITICAL_THRESHOLD = 90.0;

    private final AlertRepository alertRepository;
    private final AuditService auditService;

    public List<Alert> evaluateMetric(MonitoringMetric metric) {

        VirtualMachine virtualMachine = metric.getVirtualMachine();

        List<Alert> generatedAlerts = new ArrayList<>();

        evaluateValue(
                virtualMachine,
                metric,
                AlertType.CPU,
                metric.getCpuUsagePercent(),
                generatedAlerts
        );

        evaluateValue(
                virtualMachine,
                metric,
                AlertType.RAM,
                metric.getRamUsagePercent(),
                generatedAlerts
        );

        evaluateValue(
                virtualMachine,
                metric,
                AlertType.DISK,
                metric.getDiskUsagePercent(),
                generatedAlerts
        );

        return generatedAlerts;
    }

    private void evaluateValue(
            VirtualMachine virtualMachine,
            MonitoringMetric metric,
            AlertType type,
            Double actualValue,
            List<Alert> generatedAlerts) {

        if (actualValue == null) {
            return;
        }

        AlertSeverity severity = null;
        Double threshold = null;

        if (actualValue >= CRITICAL_THRESHOLD) {

            severity = AlertSeverity.CRITICAL;
            threshold = CRITICAL_THRESHOLD;

        } else if (actualValue >= WARNING_THRESHOLD) {

            severity = AlertSeverity.WARNING;
            threshold = WARNING_THRESHOLD;
        }

        /*
         * No threshold exceeded.
         */
        if (severity == null) {
            return;
        }

        /*
         * Check whether this VM already has an ACTIVE
         * alert for the same metric type.
         */
        Alert existingAlert =
                alertRepository
                        .findFirstByVirtualMachineIdAndTypeAndStatusOrderByCreatedAtDesc(
                                virtualMachine.getId(),
                                type,
                                AlertStatus.ACTIVE
                        )
                        .orElse(null);

        /*
         * Existing active alert:
         * update it rather than creating a duplicate.
         */
        if (existingAlert != null) {

            existingAlert.setSeverity(severity);
            existingAlert.setThresholdValue(threshold);
            existingAlert.setActualValue(actualValue);
            existingAlert.setMonitoringMetric(metric);

            existingAlert.setMessage(
                    type + " usage is " +
                            actualValue +
                            "% on virtual machine '" +
                            virtualMachine.getName() +
                            "'. Threshold: " +
                            threshold +
                            "%"
            );

            Alert updatedAlert =
                    alertRepository.save(existingAlert);

            generatedAlerts.add(updatedAlert);

            return;
        }

        /*
         * No active alert exists.
         * Create a new alert.
         */
        Alert alert = new Alert();

        alert.setVirtualMachine(virtualMachine);
        alert.setMonitoringMetric(metric);
        alert.setType(type);
        alert.setSeverity(severity);
        alert.setStatus(AlertStatus.ACTIVE);
        alert.setThresholdValue(threshold);
        alert.setActualValue(actualValue);

        alert.setMessage(
                type + " usage is " +
                        actualValue +
                        "% on virtual machine '" +
                        virtualMachine.getName() +
                        "'. Threshold: " +
                        threshold +
                        "%"
        );

        alert.setCreatedAt(
                metric.getRecordedAt() != null
                        ? metric.getRecordedAt()
                        : LocalDateTime.now()
        );

        Alert savedAlert =
                alertRepository.save(alert);

        /*
         * Record the creation of a new alert
         * using the authenticated JWT user.
         */
        auditService.logCurrentUserSuccess(
                AuditAction.CREATE_ALERT,
                "ALERT",
                String.valueOf(savedAlert.getId()),
                "Alert created: " + savedAlert.getMessage(),
                null
        );

        generatedAlerts.add(savedAlert);
    }

    public List<Alert> getAlertsByVirtualMachine(
            Long virtualMachineId) {

        return alertRepository
                .findByVirtualMachineIdOrderByCreatedAtDesc(
                        virtualMachineId
                );
    }

    public List<Alert> getActiveAlertsByVirtualMachine(
            Long virtualMachineId) {

        return alertRepository
                .findByVirtualMachineIdAndStatusOrderByCreatedAtDesc(
                        virtualMachineId,
                        AlertStatus.ACTIVE
                );
    }

    public Alert resolveAlert(Long alertId) {

        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Alert not found with id: " + alertId
                        )
                );

        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());

        Alert savedAlert =
                alertRepository.save(alert);

        /*
         * Record alert resolution using the
         * authenticated JWT user.
         */
        auditService.logCurrentUserSuccess(
                AuditAction.RESOLVE_ALERT,
                "ALERT",
                String.valueOf(savedAlert.getId()),
                "Alert resolved: " + savedAlert.getMessage(),
                null
        );

        return savedAlert;
    }
}