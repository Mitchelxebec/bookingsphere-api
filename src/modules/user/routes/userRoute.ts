import { Router } from "express";
import { userToken } from "../../../infrastructure/middleware/tokenMiddleware.js";
import upload from "../../../infrastructure/storage/multer.js";
import { uploadController } from "../controller/uploadImgController.js";
import { myAccountController } from "../controller/myAccount.js";
import { updateMyProfile } from "../controller/updateMyProfile.js";
import { deleteMyProfile } from "../controller/deleteProfile.js";

const router = Router();

router.patch("/avatar", userToken, upload.single("avatar"), uploadController);
router.get("/myaccount", userToken, myAccountController);
router.patch("/myaccount", userToken, updateMyProfile);
router.delete("/myaccount", userToken, deleteMyProfile);


export default router;
