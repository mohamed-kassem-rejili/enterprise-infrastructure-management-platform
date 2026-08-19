package com.rejili.eimp.repository;

import com.rejili.eimp.entity.MonitoringMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MonitoringMetricRepository
        extends JpaRepository<MonitoringMetric, Long> {

    List<MonitoringMetric> findByVirtualMachineIdOrderByRecordedAtDesc(
            Long virtualMachineId
    );

    List<MonitoringMetric> findByVirtualMachineIdAndRecordedAtBetweenOrderByRecordedAtDesc(
            Long virtualMachineId,
            LocalDateTime start,
            LocalDateTime end
    );
}