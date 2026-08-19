package com.rejili.eimp.repository;

import com.rejili.eimp.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findByAssetTag(String assetTag);

    boolean existsByAssetTag(String assetTag);
}