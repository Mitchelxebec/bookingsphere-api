import { ApiError } from "../../../shared/utils/ApiError.js";
import * as proprietorRepo from "../repository/proprietorRepository.js";

export const getMyListingsService = async (ownerId: string) => {
  return await proprietorRepo.findMyListings(ownerId);
};

export const createPropertyService = async (
  ownerId: string,
  data: {
    name: string;
    property_type: "HOTEL" | "APARTMENT" | "VILLA" | "GUESTHOUSE";
    location: string;
    city: string;
    country: string;
    description?: string;
    imageUrl?: string;
  },
) => {
  return await proprietorRepo.createProperty({ ...data, ownerId });
};

export const updatePropertyService = async (
  propertyId: string,
  ownerId: string,
  data: {
    name?: string;
    property_type?: "HOTEL" | "APARTMENT" | "VILLA" | "GUESTHOUSE";
    location?: string;
    city?: string;
    country?: string;
    description?: string;
    imageUrl?: string;
  },
) => {
  const existing = await proprietorRepo.findPropertyByIdAndOwner(
    propertyId,
    ownerId,
  );

  if (!existing) {
    throw new ApiError(404, "Property not found or access denied.");
  }

  const updated = await proprietorRepo.updateProperty(
    propertyId,
    ownerId,
    data,
  );

  if (!updated) {
    throw new ApiError(500, "Update failed. Please try again.");
  }

  return updated;
};

export const deletePropertyService = async (
  propertyId: string,
  ownerId: string,
) => {
  const existing = await proprietorRepo.findPropertyByIdAndOwner(
    propertyId,
    ownerId,
  );

  if (!existing) {
    throw new ApiError(404, "Property not found or access denied.");
  }

  const deleted = await proprietorRepo.softDeleteProperty(propertyId, ownerId);

  if (!deleted) {
    throw new ApiError(500, "Delete failed. Please try again.");
  }

  return deleted;
};