package com.rejili.eimp.repository;

import com.rejili.eimp.entity.Incident;
import com.rejili.eimp.entity.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository
        extends JpaRepository<Incident, Long> {

    List<Incident> findAllByOrderByCreatedAtDesc();

    List<Incident> findByStatusOrderByCreatedAtDesc(
            IncidentStatus status
    );

    List<Incident> findByAssignedToIdOrderByCreatedAtDesc(
            Long userId
    );

    List<Incident> findByVirtualMachineIdOrderByCreatedAtDesc(
            Long virtualMachineId
    );
}