import {
    Appointment,
    AppointmentStatus,
    PaymentStatus,
    Review,
    User,
    UserRole,
} from "@prisma/client";
import { existsById, prisma } from "../../services/prisma.service";
import AppError from "../../errors/AppError";
import { v4 as uuidv4 } from "uuid";
import { sslService } from "../../services/sslCommerz";
import getAllItems from "../../utls/getAllItems";
import { TQueryObject } from "../../types/common";

const createAppointment = async (data: Appointment, user: User) => {
    const isDoctorExists = await existsById(
        prisma.doctor,
        data.doctorId,
        "Doctor"
    );

    const patient = await prisma.patient.findUnique({
        where: { email: user.email },
    });
    if (!patient) throw new AppError(404, "Patient not found");

    const isDoctorScheduleExists = await prisma.doctorSchedule.findFirst({
        where: {
            doctorId: data.doctorId,
            scheduleId: data.scheduleId,
        },
    });

    if (isDoctorScheduleExists?.isBooked)
        throw new AppError(400, "This schedule is already booked");

    if (!isDoctorScheduleExists) {
        throw new AppError(404, "Doctor schedule not found!");
    }

    const videoCallingId: string = uuidv4();

    const result = await prisma.$transaction(async (tx: any) => {
        const appointment = await tx.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: data.doctorId,
                scheduleId: data.scheduleId,
                videoCallingId,
            },
            include: {
                doctor: true,
                schedule: true,
                patient: true,
            },
        });

        await tx.doctorSchedule.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: isDoctorExists.id,
                    scheduleId: data.scheduleId,
                },
            },
            data: {
                isBooked: true,
                appointmentId: appointment.id,
            },
        });

        const transactionId = `${appointment.id}-${Date.now()}`;

        const payment = await tx.payment.create({
            data: {
                appointmentId: appointment.id,
                amount: appointment.doctor.apointmentFee,
                transactionId,
            },
        });

        const initPayment = await sslService.initPayment(payment, patient);

        return initPayment;
    });

    return {
        paymentUrl: result.GatewayPageURL,
    };
};

// get my appointments...........................................................................................
const getAllAppointments = async (user: User, query: TQueryObject) => {
    const andCondtion = [];

    if (user.role === UserRole.DOCTOR) {
        andCondtion.push({
            doctor: {
                email: user.email,
            },
        });
    }
    if (user.role === UserRole.PATIENT) {
        andCondtion.push({
            patient: {
                email: user.email,
            },
        });
    }

    (user.role === UserRole.DOCTOR || user.role === UserRole.PATIENT) &&
        andCondtion.push({
            status: {
                not: AppointmentStatus.PENDING,
            },
        });

    if (query.startDate || query.endDate) {
        query.schedule = {
            ...(query.startDate && { startDateTime: { gte: query.startDate } }),
            ...(query.endDate && { endDateTime: { lte: query.endDate } }),
        };

        delete query.startDate;
        delete query.endDate;
    }
    const orderBy =
        query.sortOrder === "asc"
            ? { schedule: { startDateTime: "asc" } }
            : { schedule: { startDateTime: "desc" } };

    const searchCondition = [];
    if (query.searchTerm) {
        searchCondition.push({
            doctor: {
                name: {
                    contains: query.searchTerm,
                    mode: "insensitive",
                },
            },
        });

        searchCondition.push({
            patient: {
                name: {
                    contains: query.searchTerm,
                    mode: "insensitive",
                },
            },
        });
    }

    const allApointments = await getAllItems<any>(prisma.appointment, query, {
        andConditions: andCondtion,
        filterableFields: [
            "schedule",
            "status",
            "doctorId",
            "patientId",
            "scheduleId",
            "videoCallingId",
        ],
        include:
            user.role === UserRole.DOCTOR
                ? {
                      patient: { include: { patientMedicalHistory: true } },
                      schedule: true,
                  }
                : user.role === UserRole.PATIENT
                  ? { doctor: true, schedule: true }
                  : {
                        doctor: true,
                        patient: true,
                        schedule: true,
                    },
        orderBy: orderBy,

        extraSearchConditions: searchCondition,
        isDeletedCondition: false,
    });

    return allApointments;
};

// get all appointments........................................................................................
// const getAllAppointments = async (query: TQueryObject, user: TAuthUser) => {
//     const orderBy =
//         query.sortOrder === "asc"
//             ? { schedule: { startDateTime: "asc" } }
//             : { schedule: { startDateTime: "desc" } };

//     const appointments = await getAllItems<any>(prisma.appointment, query, {
//         filterableFields: [
//             "schedule",
//             "status",
//             "doctorId",
//             "patientId",
//             "scheduleId",
//             "videoCallingId",
//         ],
//         include: {
//             doctor: true,
//             patient: true,
//             schedule: true,
//         },
//         orderBy: orderBy,
//         isDeletedCondition: false,
//     });

//     console.log(appointments, "appointments --------------------------------");

//     return appointments;
// };

// change appointment status........................................................

const changeAppointmentStatus = async (
    appointmentId: string,
    status: AppointmentStatus,
    user: User
) => {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId, paymentStatus: PaymentStatus.PAID },
        include: { doctor: true, patient: true },
    });

    if (!appointment) {
        throw new AppError(404, "Appointment not found ");
    }

    if (
        (user.role === UserRole.DOCTOR &&
            appointment.doctor.email !== user.email) ||
        (user.role === UserRole.PATIENT &&
            appointment.patient.email !== user.email)
    ) {
        throw new AppError(
            403,
            "You are not authorized to change appointment status"
        );
    }

    const result = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status },
    });

    return result;
};

// clean unpaid appointments after every 30 minutes............................................................
const cleanUnpaidAppointments = async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unpaidAppointments = await prisma.appointment.findMany({
        where: {
            paymentStatus: PaymentStatus.UNPAID,
            createdAt: {
                lte: thirtyMinutesAgo,
            },
        },
    });

    if (unpaidAppointments.length === 0) return;

    const unpaidAppointmentIds = unpaidAppointments.map((a: any) => a.id);

    await prisma.$transaction(async (tx: any) => {
        await tx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: unpaidAppointmentIds,
                },
            },
        });

        await tx.appointment.deleteMany({
            where: {
                id: {
                    in: unpaidAppointmentIds,
                },
            },
        });

        for (const appointment of unpaidAppointments) {
            await tx.doctorSchedule.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: appointment.doctorId,
                        scheduleId: appointment.scheduleId,
                    },
                },
                data: {
                    isBooked: false,
                    appointmentId: null,
                },
            });
        }
    });
};

// const upsertReview = async (user: User, data: Review) => {
//     const isAppointmentExists = await prisma.appointment.findUnique({
//         where: {
//             id: data.appointmentId,
//         },
//     });

//     if (!isAppointmentExists) {
//         throw new AppError(404, "Appointment not found");
//     }

//     // const isReviewExists = await prisma.review.findFirst({
//     //     where: {
//     //         appointmentId: data.appointmentId,
//     //     },
//     // });

//     const result = await prisma.review.create({
//         data: {
//             ...data,
//         },
//     });

//     return result;
// };

const upsertReview = async (user: User, data: Review) => {
    const isAppointmentExists = await prisma.appointment.findUnique({
        where: {
            id: data?.appointmentId ?? undefined,
        },
    });

    if (!isAppointmentExists) {
        throw new AppError(404, "Appointment not found");
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            appointmentId: data.appointmentId,
        },
    });

    let result;

    await prisma.$transaction(async (tx: any) => {
        if (existingReview) {
            result = await prisma.review.update({
                where: {
                    id: existingReview.id,
                },
                data: { ...data },
            });
        } else {
            result = await prisma.review.create({
                data: {
                    doctorId: data.doctorId,
                    patientId: data.patientId,
                    appointmentId: data.appointmentId,
                    rating: data.rating,
                    comment: data.comment || "",
                },
            });
        }

        const doctorReviews = await prisma.review.findMany({
            where: {
                doctorId: data.doctorId,
            },
        });

        const totalRatings = doctorReviews.reduce(
            (acc: any, review: any) => acc + review.rating,
            0
        );
        const ratingCount = doctorReviews?.length;

        await tx.doctor.update({
            where: {
                id: data.doctorId,
            },
            data: {
                averageRating: totalRatings / ratingCount,
                ratingCount: ratingCount,
            },
        });
    });

    return result;
};

export const AppointmentService = {
    createAppointment,
    getAllAppointments,
    changeAppointmentStatus,
    cleanUnpaidAppointments,
    upsertReview,
};
