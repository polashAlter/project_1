import express from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleWares/validateRequest";
import { AdminValidation } from "./admin.validation";
import { handleImageUpload } from "../../middleWares/handleImageUpload";

const router = express.Router();

router.get("/", adminController.getAllAdmin);

router.get("/:id", adminController.getAdminById);

router.patch(
    "/:id",
    handleImageUpload,
    validateRequest(AdminValidation.updateAdmin),
    adminController.updateAdmin
);

router.delete("/:id", adminController.deleteAdmin);

router.delete("/soft/:id", adminController.softDelete);

export const adminRoutes = router;
