import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { prescriptionService } from "./prescription.service";

const createPrescription = catchAsync(async (req, res) => {
    const result = await prescriptionService.createPrescription(
        req.user,
        req.body
    );

    sendSuccessResponse(res, result, "Prescription created successfully", 201);
});

const getPatientPrescriptions = catchAsync(async (req, res) => {
    const result = await prescriptionService.getPatientPrescriptions(req.query);

    sendSuccessResponse(res, result, "Prescriptions fetched successfully");
})

const getAllPrescriptions = catchAsync(async (req, res) => {
    const result = await prescriptionService.getAllPrescriptions(req.query);

    sendSuccessResponse(res, result, "Prescriptions fetched successfully");
})

export const prescriptionController = {
    createPrescription,
    getPatientPrescriptions,
    getAllPrescriptions,
};