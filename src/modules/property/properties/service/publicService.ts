import { ApiError } from "../../../shared/utils/ApiError.js";
import * as publicRepo from "../repository/publicRepository.js";
import * as publicRepoTwo from "../repository/publicRepositoryTwo.js";

export const searchPropertiesService = async (filters: {
  city?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  minPrice?: number;
  maxPrice?: number;
  guestsCount?: number;
  propertyType?: "HOTEL" | "APARTMENT" | "VILLA" | "GUESTHOUSE";
  amenities?: string[];
  limit: number;
  offset: number;
}) => {
  return await publicRepo.findManyPublic(filters);
};

export const getPropertyByIdService = async (propertyId: string) => {
  const property = await publicRepoTwo.findOnePublic(propertyId);

  if (!property) {
    throw new ApiError(404, "Property not found.");
  }

  return property;
};