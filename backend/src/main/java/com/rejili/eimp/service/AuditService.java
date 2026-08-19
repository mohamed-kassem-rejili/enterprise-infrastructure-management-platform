package com.rejili.eimp.service;

import com.rejili.eimp.entity.AuditAction;
import com.rejili.eimp.entity.AuditLog;
import com.rejili.eimp.entity.User;
import com.rejili.eimp.repository.AuditLogRepository;
import com.rejili.eimp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLog logAction(
            Long userId,
            AuditAction action,
            String resourceType,
            String resourceId,
            String description,
            String ipAddress,
            boolean success) {

        User user = null;

        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "User not found with id: " + userId
                            )
                    );
        }

        AuditLog auditLog = new AuditLog();

        auditLog.setUser(user);
        auditLog.setAction(action);
        auditLog.setResourceType(resourceType);
        auditLog.setResourceId(resourceId);
        auditLog.setDescription(description);
        auditLog.setIpAddress(ipAddress);
        auditLog.setSuccess(success);

        return auditLogRepository.save(auditLog);
    }

    public AuditLog logCurrentUserAction(
            AuditAction action,
            String resourceType,
            String resourceId,
            String description,
            String ipAddress,
            boolean success) {

        String username = getCurrentUsername();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found: " + username
                        )
                );

        AuditLog auditLog = new AuditLog();

        auditLog.setUser(user);
        auditLog.setAction(action);
        auditLog.setResourceType(resourceType);
        auditLog.setResourceId(resourceId);
        auditLog.setDescription(description);
        auditLog.setIpAddress(ipAddress);
        auditLog.setSuccess(success);

        return auditLogRepository.save(auditLog);
    }

    public AuditLog logCurrentUserSuccess(
            AuditAction action,
            String resourceType,
            String resourceId,
            String description,
            String ipAddress) {

        return logCurrentUserAction(
                action,
                resourceType,
                resourceId,
                description,
                ipAddress,
                true
        );
    }

    public AuditLog logCurrentUserFailure(
            AuditAction action,
            String resourceType,
            String resourceId,
            String description,
            String ipAddress) {

        return logCurrentUserAction(
                action,
                resourceType,
                resourceId,
                description,
                ipAddress,
                false
        );
    }

    public AuditLog logSuccess(
            Long userId,
            AuditAction action,
            String resourceType,
            String resourceId,
            String description,
            String ipAddress) {

        return logAction(
                userId,
                action,
                resourceType,
                resourceId,
                description,
                ipAddress,
                true
        );
    }

    public AuditLog logFailure(
            Long userId,
            AuditAction action,
            String resourceType,
            String resourceId,
            String description,
            String ipAddress) {

        return logAction(
                userId,
                action,
                resourceType,
                resourceId,
                description,
                ipAddress,
                false
        );
    }

    public List<AuditLog> getAllLogs() {

        return auditLogRepository
                .findAllByOrderByCreatedAtDesc();
    }

    public List<AuditLog> getLogsByUser(Long userId) {

        return auditLogRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<AuditLog> getLogsByAction(
            AuditAction action) {

        return auditLogRepository
                .findByActionOrderByCreatedAtDesc(action);
    }

    public List<AuditLog> getLogsByResource(
            String resourceType,
            String resourceId) {

        return auditLogRepository
                .findByResourceTypeAndResourceIdOrderByCreatedAtDesc(
                        resourceType,
                        resourceId
                );
    }

    public AuditLog getAuditLogById(Long id) {

        return auditLogRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Audit log not found with id: " + id
                        )
                );
    }

    private String getCurrentUsername() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException(
                    "No authenticated user found"
            );
        }

        return authentication.getName();
    }
}