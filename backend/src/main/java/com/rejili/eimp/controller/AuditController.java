package com.rejili.eimp.controller;

import com.rejili.eimp.entity.AuditAction;
import com.rejili.eimp.entity.AuditLog;
import com.rejili.eimp.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs() {

        return ResponseEntity.ok(
                auditService.getAllLogs()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getAuditLogById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                auditService.getAuditLogById(id)
        );
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<AuditLog>> getLogsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                auditService.getLogsByUser(userId)
        );
    }

    @GetMapping("/actions/{action}")
    public ResponseEntity<List<AuditLog>> getLogsByAction(
            @PathVariable AuditAction action) {

        return ResponseEntity.ok(
                auditService.getLogsByAction(action)
        );
    }

    @GetMapping("/resources/{resourceType}/{resourceId}")
    public ResponseEntity<List<AuditLog>> getLogsByResource(
            @PathVariable String resourceType,
            @PathVariable String resourceId) {

        return ResponseEntity.ok(
                auditService.getLogsByResource(
                        resourceType,
                        resourceId
                )
        );
    }
}