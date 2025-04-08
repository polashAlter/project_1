import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

const createAppoinment = z.object({
    doctorId: z.string({
        required_error: "Doctor Id is required",
    }),
    scheduleId: z.string({
        required_error: "Schedule Id is required",
    }),
});

const changeAppointmentStatus = z.object({
    status: z.enum(
        [
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.INPROGRESS,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.CANCELED,
        ],
        {
            required_error: "Status is required",
        }
    ),
});

export const appointmentValidation = {
    createAppoinment,
    changeAppointmentStatus,
};
