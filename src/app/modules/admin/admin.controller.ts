import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { adminService } from "./admin.service";

const getAllAdmin = catchAsync(async (req, res) => {
    const result = await adminService.getAllLAdmin(req.query);
    sendSuccessResponse(res, result, "All Admins fetched successfully");
});

const getAdminById = catchAsync(async (req, res) => {
    const result = await adminService.getAdminById(req.params.id);
    sendSuccessResponse(res, result, "Admin fetched successfully");
});

const updateAdmin = catchAsync(async (req, res) => {
    const result = await adminService.updateAdmin(
        req?.params.id,
        req?.body?.data,
        req?.file
    );

    sendSuccessResponse(res, result, "Admin updated successfully");
});

const deleteAdmin = catchAsync(async (req, res) => {
    const result = await adminService.deleteAdmin(req.params.id);
    sendSuccessResponse(res, result, "Admin deleted successfully");
});

const softDelete = catchAsync(async (req, res) => {
    const result = await adminService.softDelete(req.params.id);
    sendSuccessResponse(res, result, "Admin  deleted successfully");
});

export const adminController = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    softDelete,
};
