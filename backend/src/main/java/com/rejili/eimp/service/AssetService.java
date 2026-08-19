package com.rejili.eimp.service;

import com.rejili.eimp.entity.Asset;
import com.rejili.eimp.entity.AuditAction;
import com.rejili.eimp.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final AuditService auditService;

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Asset not found with id: " + id
                        )
                );
    }

    public Asset createAsset(Asset asset) {

        if (assetRepository.existsByAssetTag(asset.getAssetTag())) {
            throw new RuntimeException(
                    "Asset with tag already exists: " + asset.getAssetTag()
            );
        }

        Asset savedAsset = assetRepository.save(asset);

        auditService.logCurrentUserSuccess(
                AuditAction.CREATE_ASSET,
                "ASSET",
                String.valueOf(savedAsset.getId()),
                "Asset created: " + savedAsset.getName(),
                null
        );

        return savedAsset;
    }

    public Asset updateAsset(
            Long id,
            Asset updatedAsset) {

        Asset existingAsset = getAssetById(id);

        existingAsset.setAssetTag(updatedAsset.getAssetTag());
        existingAsset.setName(updatedAsset.getName());
        existingAsset.setType(updatedAsset.getType());
        existingAsset.setManufacturer(updatedAsset.getManufacturer());
        existingAsset.setModel(updatedAsset.getModel());
        existingAsset.setSerialNumber(updatedAsset.getSerialNumber());
        existingAsset.setStatus(updatedAsset.getStatus());
        existingAsset.setLocation(updatedAsset.getLocation());
        existingAsset.setDescription(updatedAsset.getDescription());

        Asset savedAsset = assetRepository.save(existingAsset);

        auditService.logCurrentUserSuccess(
                AuditAction.UPDATE_ASSET,
                "ASSET",
                String.valueOf(savedAsset.getId()),
                "Asset updated: " + savedAsset.getName(),
                null
        );

        return savedAsset;
    }

    public void deleteAsset(Long id) {

        Asset asset = getAssetById(id);

        String assetName = asset.getName();

        assetRepository.delete(asset);

        auditService.logCurrentUserSuccess(
                AuditAction.DELETE_ASSET,
                "ASSET",
                String.valueOf(id),
                "Asset deleted: " + assetName,
                null
        );
    }
}