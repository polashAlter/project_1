import {
    Patient,
    PatientMedicalHistory,
    User,
    UserStatus,
} from "@prisma/client";
import { existsById, prisma } from "../../services/prisma.service";
import { TUpdatePatientPayload } from "./patient.validation";
import { sendImageToCloudinary } from "../../services/sendImageToCloudinary";
import { TQueryObject } from "../../types/common";
import AppError from "../../errors/AppError";
import getAllItems from "../../utls/getAllItems";
import sharp from "sharp";

const getAllPatients = async (query: TQueryObject<Patient>) => {
    const andConditions = [];
    if (query.status) andConditions.push({ user: { status: query.status } });

    const result = await getAllItems<Patient & { user: User }>(
        prisma.patient,
        query,
        {
            searchableFields: ["name", "email", "address", "contactNumber"],
            andConditions,
            include: { user: { select: { status: true } } },
        }
    );
    const patients =
        result.data.map((item) => {
            return {
                ...item,
                status: item.user.status,
            };
        }) || [];

    return { ...result, data: patients };
};

// update patient --------------------------------------------------------------
const updatePatient = async (
    patientId: string,
    payload: TUpdatePatientPayload & { status?: UserStatus },
    file: any
) => {
    const patient = await existsById(prisma.patient, patientId, "Patient");

    if (file) {
        const optimizedBuffer = await sharp(file.buffer)
            .resize({ width: 480 })
            .webp({ quality: 80 })
            .toBuffer();

        const { secure_url } = await sendImageToCloudinary(
            `patient-${patientId}`,
            optimizedBuffer
        );
        payload.profilePhoto = secure_url;
    }

    if (payload?.status) {
        const user = await prisma.user.findUnique({
            where: { email: patient?.email },
        });

        if (!user) throw new AppError(404, "User not found");

        const result = await prisma.user.update({
            where: { id: user.id },
            data: { status: payload.status },
        });

        return result;
    }
    console.log(payload, "payload ---------------------------------");

    return await prisma.patient.update({
        where: { id: patientId },
        data: payload,
    });
};

// update patient medical history --------------------------------------------------------------
const updatePatientMedicalHistory = async (
    user: User,
    payload: Partial<PatientMedicalHistory>
) => {
    const patient = await prisma.patient.findUnique({
        where: { email: user?.email },
    });
    if (!patient) throw new AppError(404, "Patient not found");
    const result = await prisma.patientMedicalHistory.upsert({
        where: { patientId: patient?.id },
        update: payload,
        create: { ...payload, patientId: patient?.id },
    });

    return result;
};

// get patient medical history --------------------------------------------------------------
const getPtMedicalHistory = async (patientId: string) => {
    const result = await prisma.patientMedicalHistory.findUnique({
        where: { patientId },
    });

    return result;
};
export const PatientService = {
    getAllPatients,
    updatePatient,
    updatePatientMedicalHistory,
    getPtMedicalHistory,
};
