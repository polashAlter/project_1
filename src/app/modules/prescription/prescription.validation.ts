import { z } from "zod";

const medicationSchema = z.object({
    name: z.string({
        required_error: "Medication name is required",
    }),
    dosage: z.string({
        required_error: "Dosage is required",
    }),
    frequency: z.string({
        required_error: "Frequency is required",
    }),
    duration: z.string({
        required_error: "Duration is required",
    }),
    instructions: z.string().optional(),
});

const prescriptionSchema = z
    .object({
        appointmentId: z.string({
            required_error: "Appointment ID is required",
        }),
        issuedAt: z.string().optional(),
        recommendedLabTests: z.string().optional(),
        diagnosis: z.string({}),
        medications: z.array(medicationSchema).nonempty({
            message: "At least one medication is required",
        }),
        note: z.string().optional(),
    })
    .strict();

export type TPrescription = z.infer<typeof prescriptionSchema>;

export const prescriptionValidation = {
    prescriptionSchema,
};
