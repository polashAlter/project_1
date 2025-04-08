import express from "express";
import { userController } from "./user.controller";
import { handleImageUpload } from "../../middleWares/handleImageUpload";
import checkAuth from "../../middleWares/checkAuth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middleWares/validateRequest";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.post(
    "/create-admin",
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    handleImageUpload,
    validateRequest(UserValidation.createAdmin),
    userController.createAdmin
);

router.post(
    "/create-doctor",
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    handleImageUpload,
    validateRequest(UserValidation.createDoctor),
    userController.createDoctor
);

router.post(
    "/create-patient",
    handleImageUpload,
    validateRequest(UserValidation.createPatient),
    userController.createPatient
);

router.get("/", userController.getAllUsers);

router.get(
    "/me",
    checkAuth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    userController.getMyProfile
);

router.patch(
    "/change-status/:id",
    validateRequest(UserValidation.updateStatus),
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    userController.changeUserStatus
);
export const userRoutes = router;
