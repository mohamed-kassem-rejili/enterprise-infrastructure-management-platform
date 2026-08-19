package com.rejili.eimp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "virtual_machines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VirtualMachine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String hostname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VmStatus status = VmStatus.STOPPED;

    @Column(nullable = false)
    private Integer cpuCores;

    @Column(nullable = false)
    private Integer ramGb;

    @Column(nullable = false)
    private Integer storageGb;

    private String operatingSystem;

    private String ipAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    public enum VmStatus {
        RUNNING,
        STOPPED,
        PAUSED
    }
}