package com.rejili.eimp.repository;

import com.rejili.eimp.entity.Alert;
import com.rejili.eimp.entity.AlertStatus;
import com.rejili.eimp.entity.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByVirtualMachineIdOrderByCreatedAtDesc(
            Long virtualMachineId
    );

    List<Alert> findByVirtualMachineIdAndStatusOrderByCreatedAtDesc(
            Long virtualMachineId,
            AlertStatus status
    );

    Optional<Alert> findFirstByVirtualMachineIdAndTypeAndStatusOrderByCreatedAtDesc(
            Long virtualMachineId,
            AlertType type,
            AlertStatus status
    );
}