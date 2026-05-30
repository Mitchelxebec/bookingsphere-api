import { Router } from "express";
import { signupController } from "../controller/registerController.js";
import { loginController } from "../controller/loginController.js";
import { userToken } from "../../../../src/modules/shared/middleware/tokenMiddleware.js";
import { requireRoles } from "../middleware/roleGuard.js";
import { getAdminDashboard } from "../controller/adminController.js";
import { validateBody } from "../middleware/validateBody.js";
import { loginSchema, registerSchema } from "../validators/authValidator.js";
import { checkCookieController } from "../controller/refreshTokenController.js";
import { logout } from "../controller/logout.js";
import { logoutAll } from "../controller/logout-all.js";
import { forgotPasswordController } from "../controller/forgotPasswordController.js";
import { verifyOtpController } from "../controller/verifyOtpController.js";
import { resetPasswordController } from "../controller/resetPasswordController.js";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     description: Creates a fresh account with default 'GUEST' role clearance.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Registration successful" }
 *       400:
 *         description: Validation failed (Zod parser rejection)
 *       409:
 *         description: Conflict. Email address is already registered
 *       500:
 *         description: Internal server error
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Auth]
 *     description: Checks if an email exists and dispatches a 6-digit verification code to their inbox. Contains a 60-second request rate limit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "pietro@gmail.com" }
 *     responses:
 *       200:
 *         description: OTP generated and transmitted successfully.
 *       404:
 *         description: User with this email does not exist.
 *       429:
 *         description: Rate limit hit. Please wait 60 seconds before retrying.
 *
 * /auth/verify-otp:
 *   post:
 *     summary: Verify the 6-digit email OTP
 *     tags: [Auth]
 *     description: Validates the temporary OTP code from Redis and yields a secure token linked to the user's identity.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email, example: "pietro@gmail.com" }
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: OTP verified. Returns the temporary reset token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 resetToken: { type: string, example: "6a8f3b2c..." }
 *       400:
 *         description: Invalid or expired verification code.
 *
 * /auth/reset-password:
 *   post:
 *     summary: Execute account password update
 *     tags: [Auth]
 *     description: Consumes the secure temporary reset token from Redis to hash and overwrite the user's password in PostgreSQL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resetToken, newPassword]
 *             properties:
 *               resetToken: { type: string, example: "6a8f3b2c..." }
 *               newPassword: { type: string, format: password, example: "BrandNewPassword99!" }
 *     responses:
 *       200:
 *         description: Password updated successfully. Old sessions terminated.
 *       400:
 *         description: Reset token is invalid or has expired.
 *
 * /auth/login:
 *   post:
 *     summary: Authenticate user credentials
 *     tags: [Auth]
 *     description: Verifies user credentials, issues a short-lived Access Token in JSON, and drops a secure HttpOnly Refresh Token cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Login verified successfully. Sets a secure HttpOnly refresh cookie.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "refreshToken=abc123xyz...; Path=/; HttpOnly; Secure; SameSite=Strict"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 accessToken: { type: string, example: "eyJhbGciOiJIUzI1Ni..." }
 *       401:
 *         description: Unauthorized. Invalid email or password combination.
 *       410:
 *         description: Gone. Account is soft-deleted and cannot establish a session.
 *       500:
 *         description: Internal server error
 *
 * /auth/refresh-token:
 *   post:
 *     summary: Rotate session credentials via Refresh Token
 *     tags: [Auth]
 *     description: Intercepts the inbound HttpOnly browser cookie, checks for reuse hijacking threats, updates rotation states, and sets a fresh token pair.
 *     responses:
 *       200:
 *         description: Access token regenerated successfully. Refreshes the secure cookie payload.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "refreshToken=new_token_abc...; Path=/; HttpOnly; Secure; SameSite=Strict"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 accessToken: { type: string, example: "eyJhbGciOiJIUzI1Ni..." }
 *       401:
 *         description: Unauthorized. Missing, invalid, or signature-expired refresh token.
 *       403:
 *         description: Forbidden. REUSE THREAT DETECTED! Wiped all active device sessions.
 *       410:
 *         description: Gone. Profile has been deactivated.
 *       500:
 *         description: Internal server error
 *
 * /auth/logout:
 *   post:
 *     summary: End current local browser session
 *     tags: [Auth]
 *     description: Clears the client's current local session cookie and invalidates that singular token string inside the database log.
 *     responses:
 *       200:
 *         description: Logged out successfully. Refresh cookie is cleared.
 *       500:
 *         description: Internal server error
 *
 * /auth/logout-all:
 *   post:
 *     summary: Revoke all active devices and sessions
 *     tags: [Auth]
 *     description: Wipes every token matching the user's ID out of the tracking tables, forcing an instant security logout on every active device.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All device connections dropped successfully.
 *       401:
 *         description: Unauthorized. Bad credentials.
 *       500:
 *         description: Internal server error
 *
 * /auth/admin-only:
 *   get:
 *     summary: Fetch restricted administrative metrics
 *     tags: [Admin]
 *     description: Multi-layered endpoint. Requires a valid userToken Bearer header AND an account containing the 'ADMIN' role profile.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Administrative metrics loaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 adminMetrics: { type: object }
 *       401:
 *         description: Unauthorized. Invalid authorization bearer signature.
 *       403:
 *         description: Forbidden. Identity verified but lacks specific administrative permission strings.
 *       500:
 *         description: Internal server error
 */

router.post("/register", validateBody(registerSchema), signupController);
router.post("/login", validateBody(loginSchema), loginController);

// REGENERATE NEW REFRESH TOKEN
router.post("/refresh-token", checkCookieController);

// FORGOT PASSWORD
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-otp", verifyOtpController);
router.post("/reset-password", resetPasswordController);

// ADMIN ROUTE
router.get(
  "/admin-only",
  userToken,
  requireRoles(["ADMIN"]),
  getAdminDashboard,
);

// LOGOUT
router.post("/logout", logout);
router.post("/logout-all", userToken, logoutAll);

export default router;
