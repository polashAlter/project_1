import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { PatientService } from "./patient.service";

const getAllPatients = catchAsync(async (req, res) => {
    const result = await PatientService.getAllPatients(req.query);
    sendSuccessResponse(res, result, "Patients fetched successfully");
});

const updatePatient = catchAsync(async (req, res) => {
    const result = await PatientService.updatePatient(
        req.params.id,
        req.body.data || req.body,
        req?.file
    );

    sendSuccessResponse(res, result, "Patient updated successfully");
});

const updatePatientMedicalHistory = catchAsync(async (req, res) => {
    const result = await PatientService.updatePatientMedicalHistory(
        req.user,
        req.body.data
    );

    sendSuccessResponse(
        res,
        result,
        "Patient medical history updated successfully"
    );
});

const getPtMedicalHistory = catchAsync(async (req, res) => {
    const result = await PatientService.getPtMedicalHistory(
        req.params.patientId
    );

    sendSuccessResponse(
        res,
        result,
        "Patient medical history fetched successfully"
    );
});

export const PatientController = {
    getAllPatients,
    updatePatient,
    updatePatientMedicalHistory,
    getPtMedicalHistory,
};
