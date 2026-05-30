import { Router } from "express";
import { userToken } from "../../shared/middleware/tokenMiddleware.js";
import upload from "../../../infrastructure/storage/multer.js";
import { uploadController } from "../controller/uploadImgController.js";
import { myAccountController } from "../controller/myAccount.js";
import { updateMyProfile } from "../controller/updateMyProfile.js";
import { deleteMyProfile } from "../controller/deleteProfile.js";

const router = Router();

/**
 * @openapi
 * /api/v1/users/avatar:
 *   patch:
 *     summary: Upload or update user profile avatar
 *     tags: [User]
 *     description: Accepts a multipart form-data image upload, streams it to Cloudinary, and links it to the logged-in user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The image file buffer (JPEG, PNG, WebP) up to 5MB.
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Avatar updated successfully" }
 *                 avatarUrl: { type: string, example: "https://cloudinary.com" }
 *       400:
 *         description: Invalid payload or missing file
 *       401:
 *         description: Unauthorized. Missing or expired token
 *       500:
 *         description: Internal server error
 * /users/myaccount:
 *   get:
 *     summary: View your account profile details
 *     tags:
 *       - User
 *     description: Retrieves the complete profile details of the logged-in user, automatically excluding the password hash string.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile account data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 userInfo:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid, example: "9c1f1ebb-11c9-4e11-8478-7d848cde5011" }
 *                     name: { type: string, example: "pietro" }
 *                     email: { type: string, format: email, example: "pietro@gmail.com" }
 *                     roles: { type: array, items: { type: string }, example: ["GUEST"] }
 *                     avatar_url: { type: string, format: url, example: "https://res.cloudinary.com/docqizapu/image/upload/v1780085772/bookingsphere/avatars/mxdypn7j8i1nhrttpjgb.png" }
 *                     phone: { type: string, nullable: true, example: null }
 *                     created_at: { type: string, format: date-time, example: "2026-05-29T19:50:48.021Z" }
 *                     deleted_at: { type: string, format: date-time, nullable: true, example: null }
 *       401:
 *         description: Access denied. Missing, invalid, or expired session token.
 *       410:
 *         description: Gone. This account has been soft-deleted.
 *       500:
 *         description: Internal server error.
 *
 *   patch:
 *     summary: Update your account details
 *     tags:
 *       - User
 *     description: Updates text profile attributes like name, phone, or email address dynamically.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "pietro updated" }
 *               phone: { type: string, example: "+1234567890" }
 *               email: { type: string, format: email, example: "pietro.new@gmail.com" }
 *     responses:
 *       200:
 *         description: Account details modified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Profile updated successfully" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid, example: "9c1f1ebb-11c9-4e11-8478-7d848cde5011" }
 *                     name: { type: string, example: "pietro updated" }
 *                     email: { type: string, example: "pietro.new@gmail.com" }
 *                     phone: { type: string, example: "+1234567890" }
 *       400:
 *         description: Bad Request. Missing attributes or invalid formats.
 *       401:
 *         description: Access denied. Missing or invalid token.
 *       410:
 *         description: Gone. Cannot update a soft-deleted profile.
 *       500:
 *         description: Internal server error.
 *
 *   delete:
 *     summary: Deactivate account (Soft Delete)
 *     tags:
 *       - User
 *     description: Toggles the deleted_at flag to render the user account inactive without ruining database historical foreign logs.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account successfully deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Account deactivated successfully" }
 *       401:
 *         description: Access denied. Missing or invalid token.
 *       500:
 *         description: Internal server error.
 */

router.patch("/avatar", userToken, upload.single("avatar"), uploadController);
router.get("/myaccount", userToken, myAccountController);
router.patch("/myaccount", userToken, updateMyProfile);
router.delete("/myaccount", userToken, deleteMyProfile);

export default router;
