import { UserStatus } from "@prisma/client";
import { z } from "zod";

const updatePatientSchema = z
    .object({
        name: z.string().optional(),
        contactNumber: z.string({}).optional(),
        address: z.string({}).optional(),
        status: z
            .enum(Object.values(UserStatus) as [string, ...string[]])
            .optional(),
        isDeleted: z.boolean().optional(),
    })
    .strict();

const ptMedicalHistorySchema = z
    .object({
        patientId: z.string().optional(),
        dateOfBirth: z.date().optional(),
        gender: z.enum(["Male", "Female"]).optional(),
        bloodGroup: z.string().optional(),
        hasAllergies: z.boolean().optional().default(false),
        hasDiabetes: z.boolean().optional().default(false),
        height: z.string().optional(),
        weight: z.string().optional(),
        smokingStatus: z.boolean().optional().default(false),
        dietaryPreferences: z.string().optional(),
        pregnancyStatus: z.boolean().optional().default(false),
        mentalHealthHistory: z.string().optional(),
        immunizationStatus: z.boolean().optional().default(false),
        hasPastSurgeries: z.boolean().optional().default(false),
        recentAnxiety: z.boolean().optional().default(false),
        recentDepression: z.boolean().optional().default(false),
        maritalStatus: z.string().optional(),
    })
    .strict();

export type TPtMedicalHistoryPayload = z.infer<typeof ptMedicalHistorySchema>;

export type TUpdatePatientPayload = z.infer<typeof updatePatientSchema> & {
    profilePhoto: string;
};

export const patientValidation = {
    updatePatientSchema,
    ptMedicalHistorySchema,
};
