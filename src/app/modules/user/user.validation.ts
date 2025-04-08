import { z } from "zod";

const createDoctor = z.object({
    password: z.string(),
    email: z.string().email(),
    name: z.string(),
    contactNumber: z.string(),
    address: z.string().nullable(),
    registrationNumber: z.string(),
    experience: z.number().int(),
    gender: z.enum(["MALE", "FEMALE"]),
    apointmentFee: z.number(),
    qualification: z.string(),
    currentWorkingPlace: z.string(),
    designation: z.string(),
    specialties: z.array(z.string()),
});

const createAdmin = z.object({
    password: z.string(),
    email: z.string().email(),
    name: z.string(),
    contactNumber: z.string(),
});

const createPatient = z.object({
    password: z.string(),
    email: z.string().email(),
    name: z.string(),
    contactNumber: z.string({}),
    address: z.string({}),
});

const updateStatus = z.object({
    body: z.object({
        status: z.enum(["PENDING", "ACTIVE", "BLOCKED"]),
    }),
});

export const UserValidation = {
    createDoctor,
    createAdmin,
    createPatient,
    updateStatus,
};
