import { z } from "zod";

const reviewZodSchema = z.object({
    appointmentId: z
        .string({ required_error: "appointmentId  is required" })
        .uuid(),
    rating: z
        .number({ required_error: "rating is required" })
        .int()
        .min(1)
        .max(5),
    comment: z.string().optional(),
});


export type TReviewPayload = z.infer<typeof reviewZodSchema>;


export const reviewValidation = {
    reviewZodSchema,
}
