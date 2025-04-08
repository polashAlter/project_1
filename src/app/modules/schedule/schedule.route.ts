import { Router } from "express";
import { ScheduleController } from "./schedule.controller";

import checkAuth from "../../middleWares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
    "/",
    // validateRequest(ScheduleValidation.createSchedule),
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    ScheduleController.createSchedule
);

router.get(
    "/",
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
    ScheduleController.getAllSchedules
);

router.delete(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    ScheduleController.deleteSchedule
);

export const scheduleRoutes = router;
