import { z } from "zod";

const createDoctorSchedule = z.object({
    scheduleIds : z.array(z.string())
})

export type TDoctorSchedulePayload = z.infer<typeof createDoctorSchedule>

export const DoctorScheduleValidation = {
    createDoctorSchedule
}