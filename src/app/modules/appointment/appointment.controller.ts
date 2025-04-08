import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { AppointmentService } from "./appointment.service";

const createAppointment = catchAsync(async (req, res) => {
    const result = await AppointmentService.createAppointment(
        req.body,
        req.user
    );

    sendSuccessResponse(
        res,
        result,
        "appointment created and payment url initialted"
    );
});

// const getMyAppointments = catchAsync(async (req, res) => {
//     const result = await AppointmentService.getMyAppointments(
//         req.user,
//         req.query
//     );

//     sendSuccessResponse(res, result, "my appointments fetched");
// });

const getAllAppointments = catchAsync(async (req, res) => {
    const result = await AppointmentService.getAllAppointments(
        req.user,
        req.query
    );

    sendSuccessResponse(res, result, "all appointments fetched");
});

const changeAppointmentStatus = catchAsync(async (req, res) => {
    const result = await AppointmentService.changeAppointmentStatus(
        req.params.id,
        req.body.status,
        req.user
    );

    console.log(result ,req.body.status,"update result and body...................." ); 

    sendSuccessResponse(res, result, "appointment status changed");
});

const upsertReview = catchAsync(async (req, res) => {
    const result = await AppointmentService.upsertReview(req.user, req.body);

    sendSuccessResponse(res, result, "review updated", 201);
});

export const AppointmentController = {
    createAppointment,
    getAllAppointments,
    changeAppointmentStatus,
    upsertReview,
};
