import { ApiError } from "../../../shared/utils/ApiError.js";
import * as adminRepo from "../repository/adminRepository.js";

export const getPendingPropertiesService = async () => {
  return await adminRepo.findAllPending();
};

export const approvePropertyService = async (propertyId: string) => {
  const existing = await adminRepo.findPropertyById(propertyId);

  if (!existing) {
    throw new ApiError(404, "Property not found.");
  }

  if (existing.approvalStatus === "APPROVED") {
    throw new ApiError(400, "Property is already approved.");
  }

  return await adminRepo.approveProperty(propertyId);
};

export const rejectPropertyService = async (
  propertyId: string,
  rejectionReason: string,
) => {
  if (!rejectionReason || rejectionReason.trim().length === 0) {
    throw new ApiError(400, "Rejection reason is required.");
  }

  const existing = await adminRepo.findPropertyById(propertyId);

  if (!existing) {
    throw new ApiError(404, "Property not found.");
  }

  if (existing.approvalStatus === "REJECTED") {
    throw new ApiError(400, "Property is already rejected.");
  }

  return await adminRepo.rejectProperty(propertyId, rejectionReason);
};

export const forceDeletePropertyService = async (propertyId: string) => {
  const existing = await adminRepo.findPropertyById(propertyId);

  if (!existing) {
    throw new ApiError(404, "Property not found or already deleted.");
  }

  const deleted = await adminRepo.forceDeleteProperty(propertyId);

  if (!deleted) {
    throw new ApiError(500, "Delete failed. Please try again.");
  }

  return deleted;
};