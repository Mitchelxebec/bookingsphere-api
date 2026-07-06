import { Router } from "express";
import { submitKycController } from "../controller/submitKycController.js";
import { userToken } from "../../shared/middleware/tokenMiddleware.js";
import { checkStatusController } from "../controller/checkStatusController.js";
import { checkIsNotProprietor } from "../middleware/kycGuard.js";

const router = Router();

router.post("/submit", userToken, checkIsNotProprietor, submitKycController);
router.get("/status", userToken, checkStatusController);

export default router;
