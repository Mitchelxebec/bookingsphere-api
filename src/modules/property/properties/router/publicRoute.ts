import { Router } from "express";
import * as controller from "../controller/publicController.js";

const router = Router();

router.get("/", controller.searchPropertiesController);
router.get("/:id", controller.getPropertyByIdController);

export default router;
