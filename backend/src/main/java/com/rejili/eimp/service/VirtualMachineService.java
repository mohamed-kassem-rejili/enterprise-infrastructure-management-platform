package com.rejili.eimp.service;

import com.rejili.eimp.entity.AuditAction;
import com.rejili.eimp.entity.VirtualMachine;
import com.rejili.eimp.repository.VirtualMachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VirtualMachineService {

    private final VirtualMachineRepository virtualMachineRepository;
    private final AuditService auditService;

    public List<VirtualMachine> getAllVirtualMachines() {
        return virtualMachineRepository.findAll();
    }

    public VirtualMachine getVirtualMachineById(Long id) {
        return virtualMachineRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Virtual machine not found with id: " + id
                        )
                );
    }

    public VirtualMachine createVirtualMachine(
            VirtualMachine virtualMachine) {

        if (virtualMachineRepository.existsByHostname(
                virtualMachine.getHostname())) {

            throw new RuntimeException(
                    "Virtual machine with hostname already exists: "
                            + virtualMachine.getHostname()
            );
        }

        VirtualMachine savedVm =
                virtualMachineRepository.save(virtualMachine);

        auditService.logCurrentUserSuccess(
                AuditAction.CREATE_VM,
                "VIRTUAL_MACHINE",
                String.valueOf(savedVm.getId()),
                "Virtual machine created: " + savedVm.getName(),
                null
        );

        return savedVm;
    }

    public VirtualMachine updateVirtualMachine(
            Long id,
            VirtualMachine updatedVm) {

        VirtualMachine existingVm =
                getVirtualMachineById(id);

        existingVm.setName(updatedVm.getName());
        existingVm.setHostname(updatedVm.getHostname());
        existingVm.setStatus(updatedVm.getStatus());
        existingVm.setCpuCores(updatedVm.getCpuCores());
        existingVm.setRamGb(updatedVm.getRamGb());
        existingVm.setStorageGb(updatedVm.getStorageGb());
        existingVm.setOperatingSystem(
                updatedVm.getOperatingSystem()
        );
        existingVm.setIpAddress(updatedVm.getIpAddress());
        existingVm.setAsset(updatedVm.getAsset());

        VirtualMachine savedVm =
                virtualMachineRepository.save(existingVm);

        auditService.logCurrentUserSuccess(
                AuditAction.UPDATE_VM,
                "VIRTUAL_MACHINE",
                String.valueOf(savedVm.getId()),
                "Virtual machine updated: " + savedVm.getName(),
                null
        );

        return savedVm;
    }

    public void deleteVirtualMachine(Long id) {

        VirtualMachine virtualMachine =
                getVirtualMachineById(id);

        String vmName = virtualMachine.getName();

        virtualMachineRepository.delete(virtualMachine);

        auditService.logCurrentUserSuccess(
                AuditAction.DELETE_VM,
                "VIRTUAL_MACHINE",
                String.valueOf(id),
                "Virtual machine deleted: " + vmName,
                null
        );
    }

    public VirtualMachine startVirtualMachine(Long id) {

        VirtualMachine virtualMachine =
                getVirtualMachineById(id);

        virtualMachine.setStatus(
                VirtualMachine.VmStatus.RUNNING
        );

        VirtualMachine savedVm =
                virtualMachineRepository.save(virtualMachine);

        auditService.logCurrentUserSuccess(
                AuditAction.START_VM,
                "VIRTUAL_MACHINE",
                String.valueOf(savedVm.getId()),
                "Virtual machine started: " + savedVm.getName(),
                null
        );

        return savedVm;
    }

    public VirtualMachine stopVirtualMachine(Long id) {

        VirtualMachine virtualMachine =
                getVirtualMachineById(id);

        virtualMachine.setStatus(
                VirtualMachine.VmStatus.STOPPED
        );

        VirtualMachine savedVm =
                virtualMachineRepository.save(virtualMachine);

        auditService.logCurrentUserSuccess(
                AuditAction.STOP_VM,
                "VIRTUAL_MACHINE",
                String.valueOf(savedVm.getId()),
                "Virtual machine stopped: " + savedVm.getName(),
                null
        );

        return savedVm;
    }

    public VirtualMachine pauseVirtualMachine(Long id) {

        VirtualMachine virtualMachine =
                getVirtualMachineById(id);

        virtualMachine.setStatus(
                VirtualMachine.VmStatus.PAUSED
        );

        VirtualMachine savedVm =
                virtualMachineRepository.save(virtualMachine);

        auditService.logCurrentUserSuccess(
                AuditAction.PAUSE_VM,
                "VIRTUAL_MACHINE",
                String.valueOf(savedVm.getId()),
                "Virtual machine paused: " + savedVm.getName(),
                null
        );

        return savedVm;
    }

    public VirtualMachine rebootVirtualMachine(Long id) {

        VirtualMachine virtualMachine =
                getVirtualMachineById(id);

        // Application-level reboot representation.
        virtualMachine.setStatus(
                VirtualMachine.VmStatus.RUNNING
        );

        VirtualMachine savedVm =
                virtualMachineRepository.save(virtualMachine);

        auditService.logCurrentUserSuccess(
                AuditAction.REBOOT_VM,
                "VIRTUAL_MACHINE",
                String.valueOf(savedVm.getId()),
                "Virtual machine rebooted: " + savedVm.getName(),
                null
        );

        return savedVm;
    }
}