import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { DoctorService } from "./doctor.service";

const updateDoctor = catchAsync(async (req, res) => {
    
    const result = await DoctorService.updateDoctor(
        req?.params.doctorId,
        req?.body?.data,
        req?.file
    );
    sendSuccessResponse(res, result, "Doctor updated successfully");
});

const getAllDoctors = catchAsync(async (req, res) => {
    const result = await DoctorService.getAllDoctors(req.query);

    sendSuccessResponse(res, result, "All Doctors fetched successfully", 200);
});

const getDoctorById = catchAsync(async (req, res) => {
    const result = await DoctorService.getDoctorById(req.params.doctorId);
    sendSuccessResponse(res, result, "Doctor fetched successfully", 200);
});

const deleteDoctor = catchAsync(async (req, res) => {
    const result = await DoctorService.deleteDocotr(req.params.doctorId);
    sendSuccessResponse(res, result, "Doctor deleted successfully");
});

const softDeleteDoctor = catchAsync(async (req, res) => {
    const result = await DoctorService.softDeleteDoctor(req.params.doctorId);
    sendSuccessResponse(res, result, "Doctor deleted successfully");
});

export const DoctorController = {
    updateDoctor,
    getAllDoctors,
    getDoctorById,
    deleteDoctor,
    softDeleteDoctor,
};
