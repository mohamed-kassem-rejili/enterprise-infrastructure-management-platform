package com.rejili.eimp.repository;

import com.rejili.eimp.entity.VirtualMachine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VirtualMachineRepository extends JpaRepository<VirtualMachine, Long> {

    Optional<VirtualMachine> findByHostname(String hostname);

    boolean existsByHostname(String hostname);
}