import { Router } from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import checkAuth from "../../middleWares/checkAuth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middleWares/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";

const router = Router();

router.post(
    "/",
    validateRequest(DoctorScheduleValidation.createDoctorSchedule),
    checkAuth(UserRole.DOCTOR),
    DoctorScheduleController.createDoctorSchedule
);

router.get(
    "/",
    checkAuth(UserRole.PATIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    DoctorScheduleController.getDoctorSchedules
);

router.get(
    "/my-schedules",
    checkAuth(UserRole.DOCTOR),
    DoctorScheduleController.getMySchedules
);

router.delete(
    "/:scheduleId",
    checkAuth(UserRole.DOCTOR),
    DoctorScheduleController.deleteDocotrSchedule
);

export const doctorScheduleRoutes = router;
