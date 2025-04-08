import { Router } from "express";
import checkAuth from "../../middleWares/checkAuth";
import { UserRole } from "@prisma/client";
import { AppointmentController } from "./appointment.controller";
import validateRequest from "../../middleWares/validateRequest";
import { appointmentValidation } from "./appointment.validation";

const router = Router();

router.post(
    "/",
    checkAuth(UserRole.PATIENT),
    validateRequest(appointmentValidation.createAppoinment),
    AppointmentController.createAppointment
);
router.get(
    "/",
    checkAuth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    AppointmentController.getAllAppointments
);
// router.get(
//     "/my-appointments",
//     checkAuth(UserRole.DOCTOR, UserRole.PATIENT),
//     AppointmentController.getMyAppointments
// );

router.patch(
    "/:id",
    checkAuth(
        UserRole.DOCTOR,
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN,
        UserRole.PATIENT
    ),
    validateRequest(appointmentValidation.changeAppointmentStatus),
    AppointmentController.changeAppointmentStatus
);

router.post(
    "/review",
    checkAuth(UserRole.PATIENT),
    AppointmentController.upsertReview
);

export const AppointmentRouter = router;
