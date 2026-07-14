import { Router } from "express";
import { userToken } from "../../shared/middleware/tokenMiddleware.js";
import { messageController } from "../controller/messageController.js";

const router = Router({ mergeParams: true });

router.get("/messages", userToken, messageController);

export default router;
