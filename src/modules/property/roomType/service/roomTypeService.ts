import { ApiError } from "../../../shared/utils/ApiError.js";
import * as roomTypeRepo from "../repository/roomTypeRepository.js";

const MIN_CAPACITY = 1;
const MAX_CAPACITY = 10;

export const getRoomTypesService = async (propertyId: string) => {
  return await roomTypeRepo.findRoomTypesByProperty(propertyId);
};

export const createRoomTypeService = async (
  propertyId: string,
  ownerId: string,
  data: {
    name: string;
    basePrice: string;
    capacity: number;
    description?: string;
  },
) => {
  // 1. Confirm the proprietor actually owns this property
  const property = await roomTypeRepo.findPropertyByIdAndOwner(
    propertyId,
    ownerId,
  );

  if (!property) {
    throw new ApiError(404, "Property not found or access denied.");
  }

  // 2. Validate capacity bounds
  if (
    !Number.isInteger(data.capacity) ||
    data.capacity < MIN_CAPACITY ||
    data.capacity > MAX_CAPACITY
  ) {
    throw new ApiError(
      400,
      `Capacity must be a whole number between ${MIN_CAPACITY} and ${MAX_CAPACITY}.`,
    );
  }

  // 3. Validate price is a sane positive number
  const priceValue = parseFloat(data.basePrice);
  if (isNaN(priceValue) || priceValue <= 0) {
    throw new ApiError(400, "Base price must be a positive number.");
  }

  return await roomTypeRepo.createRoomType({
    property_id: propertyId,
    name: data.name,
    basePrice: data.basePrice,
    capacity: data.capacity,
    ...(data.description && { description: data.description }),
  });
};

export const updateRoomTypeService = async (
  roomTypeId: string,
  ownerId: string,
  data: {
    name?: string;
    basePrice?: string;
    capacity?: number;
    description?: string;
  },
) => {
  // 1. Confirm ownership through the property chain
  const existing = await roomTypeRepo.findRoomTypeByIdAndOwner(
    roomTypeId,
    ownerId,
  );

  if (!existing) {
    throw new ApiError(404, "Room type not found or access denied.");
  }

  // 2. Validate capacity bounds if provided
  if (data.capacity !== undefined) {
    if (
      !Number.isInteger(data.capacity) ||
      data.capacity < MIN_CAPACITY ||
      data.capacity > MAX_CAPACITY
    ) {
      throw new ApiError(
        400,
        `Capacity must be a whole number between ${MIN_CAPACITY} and ${MAX_CAPACITY}.`,
      );
    }
  }

  // 3. Validate price if provided
  if (data.basePrice !== undefined) {
    const priceValue = parseFloat(data.basePrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      throw new ApiError(400, "Base price must be a positive number.");
    }
  }

  const updated = await roomTypeRepo.updateRoomType(roomTypeId, data);

  if (!updated) {
    throw new ApiError(500, "Update failed. Please try again.");
  }

  return updated;
};

export const deleteRoomTypeService = async (
  roomTypeId: string,
  ownerId: string,
) => {
  const existing = await roomTypeRepo.findRoomTypeByIdAndOwner(
    roomTypeId,
    ownerId,
  );

  if (!existing) {
    throw new ApiError(404, "Room type not found or access denied.");
  }

  const deleted = await roomTypeRepo.softDeleteRoomType(roomTypeId);

  if (!deleted) {
    throw new ApiError(500, "Delete failed. Please try again.");
  }

  return deleted;
};
