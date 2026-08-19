package com.rejili.eimp.service;

import com.rejili.eimp.entity.Alert;
import com.rejili.eimp.entity.AuditAction;
import com.rejili.eimp.entity.Incident;
import com.rejili.eimp.entity.IncidentStatus;
import com.rejili.eimp.entity.User;
import com.rejili.eimp.entity.VirtualMachine;
import com.rejili.eimp.dto.IncidentRequest;
import com.rejili.eimp.repository.AlertRepository;
import com.rejili.eimp.repository.IncidentRepository;
import com.rejili.eimp.repository.UserRepository;
import com.rejili.eimp.repository.VirtualMachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final VirtualMachineRepository virtualMachineRepository;
    private final AlertRepository alertRepository;
    private final AuditService auditService;

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Incident> getIncidentsByStatus(
            IncidentStatus status) {

        return incidentRepository
                .findByStatusOrderByCreatedAtDesc(status);
    }

    public List<Incident> getIncidentsAssignedToUser(
            Long userId) {

        getUser(userId);

        return incidentRepository
                .findByAssignedToIdOrderByCreatedAtDesc(userId);
    }

    public List<Incident> getIncidentsByVirtualMachine(
            Long virtualMachineId) {

        getVirtualMachine(virtualMachineId);

        return incidentRepository
                .findByVirtualMachineIdOrderByCreatedAtDesc(
                        virtualMachineId
                );
    }

    public Incident getIncidentById(Long id) {

        return incidentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Incident not found with id: " + id
                        )
                );
    }

    public Incident createIncident(
            IncidentRequest request,
            Long createdByUserId) {

        User createdBy = getUser(createdByUserId);

        Incident incident = new Incident();

        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setPriority(request.getPriority());
        incident.setCreatedBy(createdBy);

        if (request.getVirtualMachineId() != null) {

            incident.setVirtualMachine(
                    getVirtualMachine(request.getVirtualMachineId())
            );
        }

        if (request.getAlertId() != null) {

            Alert alert = alertRepository.findById(
                    request.getAlertId()
            ).orElseThrow(() ->
                    new RuntimeException(
                            "Alert not found with id: "
                                    + request.getAlertId()
                    )
            );

            incident.setAlert(alert);
        }

        if (request.getAssignedToUserId() != null) {

            User assignedTo =
                    getUser(request.getAssignedToUserId());

            incident.setAssignedTo(assignedTo);
            incident.setStatus(IncidentStatus.ASSIGNED);

        } else {

            incident.setStatus(IncidentStatus.OPEN);
        }

        Incident savedIncident =
                incidentRepository.save(incident);

        auditService.logSuccess(
                createdByUserId,
                AuditAction.CREATE_INCIDENT,
                "INCIDENT",
                String.valueOf(savedIncident.getId()),
                "Incident created: " + savedIncident.getTitle(),
                null
        );

        return savedIncident;
    }

    public Incident assignIncident(
            Long incidentId,
            Long userId) {

        Incident incident =
                getIncidentById(incidentId);

        User user = getUser(userId);

        incident.setAssignedTo(user);

        if (incident.getStatus() == IncidentStatus.OPEN) {
            incident.setStatus(IncidentStatus.ASSIGNED);
        }

        Incident savedIncident =
                incidentRepository.save(incident);

        Long auditUserId =
                incident.getCreatedBy() != null
                        ? incident.getCreatedBy().getId()
                        : null;

        auditService.logSuccess(
                auditUserId,
                AuditAction.ASSIGN_INCIDENT,
                "INCIDENT",
                String.valueOf(savedIncident.getId()),
                "Incident assigned to user: "
                        + user.getUsername(),
                null
        );

        return savedIncident;
    }

    public Incident updateStatus(
            Long incidentId,
            IncidentStatus status) {

        Incident incident =
                getIncidentById(incidentId);

        incident.setStatus(status);

        if (status == IncidentStatus.RESOLVED ||
                status == IncidentStatus.CLOSED) {

            incident.setResolvedAt(LocalDateTime.now());
        }

        Incident savedIncident =
                incidentRepository.save(incident);

        Long auditUserId =
                incident.getCreatedBy() != null
                        ? incident.getCreatedBy().getId()
                        : null;

        auditService.logSuccess(
                auditUserId,
                AuditAction.UPDATE_INCIDENT_STATUS,
                "INCIDENT",
                String.valueOf(savedIncident.getId()),
                "Incident status changed to: " + status,
                null
        );

        return savedIncident;
    }

    public Incident resolveIncident(Long incidentId) {

        Incident incident =
                getIncidentById(incidentId);

        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedAt(LocalDateTime.now());

        Incident savedIncident =
                incidentRepository.save(incident);

        Long auditUserId =
                incident.getCreatedBy() != null
                        ? incident.getCreatedBy().getId()
                        : null;

        auditService.logSuccess(
                auditUserId,
                AuditAction.RESOLVE_INCIDENT,
                "INCIDENT",
                String.valueOf(savedIncident.getId()),
                "Incident resolved: " + savedIncident.getTitle(),
                null
        );

        return savedIncident;
    }

    public Incident closeIncident(Long incidentId) {

        Incident incident =
                getIncidentById(incidentId);

        incident.setStatus(IncidentStatus.CLOSED);

        if (incident.getResolvedAt() == null) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        Incident savedIncident =
                incidentRepository.save(incident);

        Long auditUserId =
                incident.getCreatedBy() != null
                        ? incident.getCreatedBy().getId()
                        : null;

        auditService.logSuccess(
                auditUserId,
                AuditAction.CLOSE_INCIDENT,
                "INCIDENT",
                String.valueOf(savedIncident.getId()),
                "Incident closed: " + savedIncident.getTitle(),
                null
        );

        return savedIncident;
    }

    public void deleteIncident(Long incidentId) {

        Incident incident =
                getIncidentById(incidentId);

        Long auditUserId =
                incident.getCreatedBy() != null
                        ? incident.getCreatedBy().getId()
                        : null;

        Long id = incident.getId();
        String title = incident.getTitle();

        incidentRepository.delete(incident);

        auditService.logSuccess(
                auditUserId,
                AuditAction.DELETE_INCIDENT,
                "INCIDENT",
                String.valueOf(id),
                "Incident deleted: " + title,
                null
        );
    }

    private User getUser(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );
    }

    private VirtualMachine getVirtualMachine(Long id) {

        return virtualMachineRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Virtual machine not found with id: " + id
                        )
                );
    }
}