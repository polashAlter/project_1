import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import validateRequest from "../../middleWares/validateRequest";
import { DoctorValidation } from "./doctor.validation";
import { handleImageUpload } from "../../middleWares/handleImageUpload";

const router = Router();

router.patch(
    "/:doctorId",
    handleImageUpload,
    validateRequest(DoctorValidation.updateDoctor),
    DoctorController.updateDoctor
);

router.get("/", DoctorController.getAllDoctors);
router.get("/:doctorId", DoctorController.getDoctorById);

router.delete("/:doctorId", DoctorController.deleteDoctor);

router.delete("/soft-delete/:doctorId", DoctorController.softDeleteDoctor);

export const doctorRoutes = router;
