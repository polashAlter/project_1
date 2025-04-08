import { string, z } from "zod";

const updateDoctor = z.object({
    name: z.string().optional(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().optional(),
    registrationNumber: z.string().optional(),
    experience: z.number().optional(),
    gender: z.string().optional(),
    apointmentFee: z.number().optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
    specialties: z.array(string()).optional(),
});

export type TUpdateDoctorPayload = z.infer<typeof updateDoctor>;

export const DoctorValidation = {
    updateDoctor,
};
