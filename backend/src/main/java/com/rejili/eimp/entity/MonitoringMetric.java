package com.rejili.eimp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "monitoring_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "virtual_machine_id", nullable = false)
    private VirtualMachine virtualMachine;

    @Column(nullable = false)
    private Double cpuUsagePercent;

    @Column(nullable = false)
    private Double ramUsagePercent;

    @Column(nullable = false)
    private Double diskUsagePercent;

    private Double networkInMbps;

    private Double networkOutMbps;

    @Column(nullable = false)
    private LocalDateTime recordedAt;
}