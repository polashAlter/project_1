import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { DoctorScheduleService } from "./doctorSchedule.service";

const createDoctorSchedule = catchAsync(async (req, res) => {
    const result = await DoctorScheduleService.createDoctorSchedule(
        req.user,
        req.body
    );
    sendSuccessResponse(
        res,
        result,
        "Doctor Schedules created successfully",
        201
    );
});

const getMySchedules = catchAsync(async (req, res) => {
    const result = await DoctorScheduleService.getMySchedules(
        req.user,
        req.query
    );

    sendSuccessResponse(res, result, "Doctor Schedules fetched successfully");
});

const getDoctorSchedules = catchAsync(async (req, res) => {
    const result = await DoctorScheduleService.getDoctorSchedules(req.query);
    sendSuccessResponse(res, result, "Doctor Schedules fetched successfully");
});

const deleteDocotrSchedule = catchAsync(async (req, res) => {
    const result = await DoctorScheduleService.deleteDocotrSchedule(
        req.user,
        req.params.scheduleId
    );

    sendSuccessResponse(res, result, "Doctor Schedules deleted successfully");
});

export const DoctorScheduleController = {
    createDoctorSchedule,
    getMySchedules,
    getDoctorSchedules,
    deleteDocotrSchedule,
};
