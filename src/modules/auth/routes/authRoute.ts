import { Router } from "express";
import { signupController } from "../controller/registerController.js";
import { loginController } from "../controller/loginController.js";
import { userToken } from "../middleware/tokenMiddleware.js";
import { getMeController } from "../controller/getMe.js";
import { requireRoles } from "../middleware/roleGuard.js";
import { getAdminDashboard } from "../controller/adminController.js";
import { validateBody } from "../middleware/validateBody.js";
import { loginSchema, registerSchema } from "../validators/authValidator.js";
import { checkCookieController } from "../controller/refreshTokenController.js";
import { logout } from "../controller/logout.js";
import { logoutAll } from "../controller/logout-all.js";

const router = Router();

router.post("/register", validateBody(registerSchema), signupController);
router.post("/login", validateBody(loginSchema), loginController);
router.get("/me", userToken, getMeController);

// REGENERATE NEW REFRESH TOKEN
router.post("/refresh-token", checkCookieController);

// ADMIN ROUTE
router.get(
  "/admin-only",
  userToken,
  requireRoles(["ADMIN"]),
  getAdminDashboard,
);

// LOGOUT
router.post("/logout", logout);
router.post("/logout-all", userToken, logoutAll)

export default router;
