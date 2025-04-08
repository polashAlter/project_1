import { Router } from "express";
import { authControllers } from "./auth.controller";
import checkAuth from "../../middleWares/checkAuth";
import { UserRole } from "@prisma/client";

import validateRequest from "../../middleWares/validateRequest";
import { authValidationSchema } from "./auth.validation";

const router = Router();

router.post(
    "/login",
    validateRequest(authValidationSchema.loginValidationSchema),
    authControllers.logIn
);
router.post(
    "/change-password",
    checkAuth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    authControllers.changePassword
);

router.post("/forgot-password", authControllers.forgotPassword);

router.patch(
    "/reset-password",
    validateRequest(authValidationSchema.resetPasswordZodSchema),
    authControllers.resetPassword
);

router.post("/refresh-token", authControllers.refresh);

router.get("/login-with-google", authControllers.LoginWithGoogle);

router.get("/login-with-google/callback", authControllers.googleCallback);

export const authRoutes = router;
