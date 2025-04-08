import { Router } from "express";
import checkAuth from "../../middleWares/checkAuth";
import { UserRole } from "@prisma/client";
import { MetaController } from "./meta.controller";

const router = Router();

router.get(
    "/",
    checkAuth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    MetaController.getDashboardMetaData
);

router.get(
    "/bar-chart",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
    MetaController.getBarChartData
);

router.get(
    "/line-chart",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
    MetaController.revenueLineChartData
);

export const MetaRoutes = router;
