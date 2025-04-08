import { Router } from "express";
import checkAuth from "../../middleWares/checkAuth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middleWares/validateRequest";
import { prescriptionValidation } from "./prescription.validation";
import { prescriptionController } from "./prescription.controller";

const router = Router();

router.post(
    "/",
    checkAuth(UserRole.DOCTOR),
    validateRequest(prescriptionValidation.prescriptionSchema),
    prescriptionController.createPrescription
);

router.get(
    "/my-prescriptions",
    checkAuth(UserRole.PATIENT),
    prescriptionController.getPatientPrescriptions
);

router.get("/", checkAuth(UserRole.ADMIN,"SUPER_ADMIN"), prescriptionController.getAllPrescriptions);

export const prescriptionRoutes = router;
