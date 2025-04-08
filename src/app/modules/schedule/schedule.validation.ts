import { z } from "zod";

const createSchedule = z.object({
    startDate: z.string({
        required_error: "Start date is required",
    }),
    endDate: z.string({
        required_error: "End date is required",
    }),
    startTime: z.string({
        required_error: "Start time is required",
    }),
    endTime: z.string({
        required_error: "End time is required",
    }),
    timeZone: z.string().optional(),
    duration: z.number().optional(),
});

export const ScheduleValidation = {
    createSchedule,
};

export type TSchedule = z.infer<typeof createSchedule>;
