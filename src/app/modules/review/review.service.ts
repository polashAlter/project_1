import { Doctor, Patient, Review, User } from "@prisma/client";
import { TReviewPayload } from "./review.validation";
import { prisma } from "../../services/prisma.service";
import AppError from "../../errors/AppError";
import { TQueryObject } from "../../types/common";
import getAllItems from "../../utls/getAllItems";

const upsertReview = async (user: User, payload: TReviewPayload) => {
    const appointment = await prisma.appointment.findFirst({
        where: {
            id: payload.appointmentId,
        },
        include: {
            patient: true,
        },
    });

    if (!appointment) throw new AppError(404, "Appointment not found");

    const reviewExists = await prisma.review.findFirst({
        where: {
            appointmentId: payload.appointmentId,
        },
    });

    if (reviewExists) throw new AppError(400, "Review already exists");

    if (appointment.patient.email !== user.email) {
        throw new AppError(
            403,
            "You are not authorized to review this appointment"
        );
    }

    const result = await prisma.$transaction(async (tx:any) => {
        const review = await tx.review.create({
            data: {
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                ...payload,
            },
        });

        const averagerating = await prisma.review.aggregate({
            where: {
                doctorId: appointment.doctorId,
            },
            _avg: {
                rating: true,
            },
        });

        await tx.doctor.update({
            where: {
                id: appointment.doctorId,
            },
            data: {
                averageRating: averagerating._avg.rating,
            },
        });

        return review;
    });

    return result;
};

const getReviews = async (query: TQueryObject) => {
    const reviews = getAllItems<Review & { doctor: Doctor; patient: Patient }>(
        prisma.review,
        query,
        {
            filterableFields: ["doctorId", "patientId"],
            include: {
                doctor: true,
                patient: true,
            },
            isDeletedCondition: false,
        },

    );

    return reviews;
};

export const ReviewService = {
    upsertReview,
    getReviews,
};
