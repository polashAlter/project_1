import {
    Doctor,
    Medication,
    Patient,
    PaymentStatus,
    Prescription,
    User,
} from "@prisma/client";
import { prisma } from "../../services/prisma.service";
import AppError from "../../errors/AppError";
import { TPrescription } from "./prescription.validation";
import getAllItems from "../../utls/getAllItems";
import { TQueryObject } from "../../types/common";

type TPrescriptionWithMedications = Prescription & {
    medications: Medication[];
    doctor: Doctor;
    patient: Patient;
};

const createPrescription = async (user: User, data: TPrescription) => {
    const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId, paymentStatus: PaymentStatus.PAID },
        include: { doctor: true },
    });

    if (!appointment) throw new AppError(404, "Appointment not found ");

    if (appointment.doctor.email !== user.email) {
        throw new AppError(
            403,
            "You are not authorized to create prescription"
        );
    }

    const presceiption = await prisma.prescription.findFirst({
        where: { appointmentId: data.appointmentId },
    });

    if (presceiption) {
        throw new AppError(400, "Prescription already exists");
    }

    const { medications, ...prescription } = data;

    const result = await prisma.$transaction(async (tx:any) => {
        const newPrescription = await tx.prescription.create({
            data: {
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                ...prescription,
                issuedAt: prescription.issuedAt || new Date(),
            },
        });

        const medicationData = medications.map((medication) => {
            return {
                ...medication,
                prescriptionId: newPrescription.id,
            };
        });

        await tx.medication.createMany({
            data: medicationData,
        });

        return;
    });

    return result;
};

const getPatientPrescriptions = async (query: TQueryObject) => {
    const prescriptions = getAllItems<TPrescriptionWithMedications>(
        prisma.prescription,
        query,
        {
            filterableFields: ["appointmentId"],
            include: {
                medications: true,
                doctor: true,
                patient: { include: { patientMedicalHistory: true } },
            },
        }
    );

    return prescriptions;
};

const getAllPrescriptions = async (query: TQueryObject) => {
    const prescriptions = getAllItems<TPrescriptionWithMedications>(
        prisma.prescription,
        query,
        {
            filterableFields: ["issuedAt", "doctorId", "patientId"],
            include: {
                medications: true,
            },
        }
    );

    return prescriptions;
};

export const prescriptionService = {
    createPrescription,
    getPatientPrescriptions,
    getAllPrescriptions,
};
