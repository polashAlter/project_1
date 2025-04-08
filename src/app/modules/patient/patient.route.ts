import { Router } from "express";
import { PatientController } from "./patient.controller";
import validateRequest from "../../middleWares/validateRequest";
import { patientValidation } from "./patient.validation";
import { handleImageUpload } from "../../middleWares/handleImageUpload";
import checkAuth from "../../middleWares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/", checkAuth(UserRole.ADMIN), PatientController.getAllPatients);

router.patch(
    "/:id",
    checkAuth(UserRole.PATIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    handleImageUpload,
    validateRequest(patientValidation.updatePatientSchema),
    PatientController.updatePatient
);

router.put(
    "/medical-history",
    checkAuth(UserRole.PATIENT),
    handleImageUpload,
    PatientController.updatePatientMedicalHistory
);

router.get(
    "/medical-history/:patientId",
    checkAuth(UserRole.PATIENT, UserRole.DOCTOR),
    PatientController.getPtMedicalHistory
);

export const patientRouter = router;
