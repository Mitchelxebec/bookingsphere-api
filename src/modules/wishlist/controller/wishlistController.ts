import type { NextFunction, Request, Response } from "express";
import * as wishlistService from "../service/wishlistService.js";

export const addToWishlistController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { propertyId } = req.params as { propertyId: string };

    const result = await wishlistService.addToWishlistService(
      userId,
      propertyId,
    );

    res.status(200).json({
      success: true,
      message: "Property saved to wishlist.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlistController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { propertyId } = req.params as { propertyId: string };

    const result = await wishlistService.removeFromWishlistService(
      userId,
      propertyId,
    );

    res.status(200).json({
      success: true,
      message: "Property removed from wishlist.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyWishlistController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;

    const wishlistItems = await wishlistService.getMyWishlistService(userId);

    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully.",
      data: wishlistItems,
    });
  } catch (error) {
    next(error);
  }
};