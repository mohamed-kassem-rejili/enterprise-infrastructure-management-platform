package com.rejili.eimp.controller;

import com.rejili.eimp.entity.VirtualMachine;
import com.rejili.eimp.service.VirtualMachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vms")
@RequiredArgsConstructor
public class VirtualMachineController {

    private final VirtualMachineService virtualMachineService;

    @GetMapping
    public ResponseEntity<List<VirtualMachine>> getAllVirtualMachines() {
        return ResponseEntity.ok(
                virtualMachineService.getAllVirtualMachines()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<VirtualMachine> getVirtualMachineById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                virtualMachineService.getVirtualMachineById(id)
        );
    }

    @PostMapping
    public ResponseEntity<VirtualMachine> createVirtualMachine(
            @RequestBody VirtualMachine virtualMachine) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        virtualMachineService
                                .createVirtualMachine(virtualMachine)
                );
    }

    @PutMapping("/{id}")
    public ResponseEntity<VirtualMachine> updateVirtualMachine(
            @PathVariable Long id,
            @RequestBody VirtualMachine virtualMachine) {

        return ResponseEntity.ok(
                virtualMachineService.updateVirtualMachine(
                        id,
                        virtualMachine
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVirtualMachine(
            @PathVariable Long id) {

        virtualMachineService.deleteVirtualMachine(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<VirtualMachine> startVirtualMachine(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                virtualMachineService.startVirtualMachine(id)
        );
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<VirtualMachine> stopVirtualMachine(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                virtualMachineService.stopVirtualMachine(id)
        );
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<VirtualMachine> pauseVirtualMachine(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                virtualMachineService.pauseVirtualMachine(id)
        );
    }

    @PostMapping("/{id}/reboot")
    public ResponseEntity<VirtualMachine> rebootVirtualMachine(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                virtualMachineService.rebootVirtualMachine(id)
        );
    }
}