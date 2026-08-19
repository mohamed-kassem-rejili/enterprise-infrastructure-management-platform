package com.rejili.eimp.repository;

import com.rejili.eimp.entity.AuditAction;
import com.rejili.eimp.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByCreatedAtDesc();

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    List<AuditLog> findByActionOrderByCreatedAtDesc(
            AuditAction action
    );

    List<AuditLog> findByResourceTypeAndResourceIdOrderByCreatedAtDesc(
            String resourceType,
            String resourceId
    );
}