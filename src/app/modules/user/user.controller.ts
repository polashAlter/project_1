import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { userService } from "./user.service";

const createAdmin = catchAsync(async (req, res) => {
    const result = await userService.createAdmin(req.body.data);

    sendSuccessResponse(res, result, "Admin created successfully", 201);
});

const createDoctor = catchAsync(async (req, res) => {
    const result = await userService.createDoctor(req.body.data);

    sendSuccessResponse(res, result, "Doctor created successfully", 201);
});

const createPatient = catchAsync(async (req, res) => {
    const result = await userService.createPatient(req.body.data);

    sendSuccessResponse(res, result, "Patient created successfully", 201);
});

const getAllUsers = catchAsync(async (req, res) => {
    const result = await userService.getAllUsers(req.query);

    sendSuccessResponse(res, result, "Users fetched successfully");
});

const getMyProfile = catchAsync(async (req, res) => {
    const result = await userService.getMyProfile(req.user);
    sendSuccessResponse(res, result, "Profile fetched successfully");
});

const changeUserStatus = catchAsync(async (req, res) => {
    const result = await userService.changeUserStatus(
        req.params.id,
        req.body.status
    );

    sendSuccessResponse(res, result, "User status changed successfully");
});

export const userController = {
    createAdmin,
    createDoctor,
    createPatient,
    getAllUsers,
    getMyProfile,
    changeUserStatus,
};
