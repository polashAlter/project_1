import { TSchedule } from "./schedule.validation";
import { toZonedTime } from "date-fns-tz";
import { addDays, addMinutes, format } from "date-fns";
import config from "../../config";
import { Prisma, Schedule, User, UserRole } from "@prisma/client";
import { prisma } from "../../services/prisma.service";

import { TQueryObject } from "../../types/common";
import AppError from "../../errors/AppError";

const createSchedule = async (payload: TSchedule): Promise<Schedule[]> => {
    const interverlTime = payload.duration || 30;

    const schedules = [];

    const timeZone =
        payload.timeZone ||
        config.timeZone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone;

    let startDate = toZonedTime(new Date(payload.startDate), timeZone);
    const endDate = toZonedTime(new Date(payload.endDate), timeZone);
    const startTime = toZonedTime(new Date(payload.startTime), timeZone);
    let endTime = toZonedTime(new Date(payload.endTime), timeZone);

    const formattedStartDate = format(startDate, "yyyy-MM-dd"); // retrieve only date from startDate

    const formattedStartTime = format(startTime, "HH:mm:ss"); // retrieve only time  from startTime

    let startDateTime = new Date(`${formattedStartDate}T${formattedStartTime}`); //new date object with date and time

    while (startDate <= endDate) {
        let slotStartTime = startDateTime;

        while (slotStartTime < endTime) {
            const slotEndTime = addMinutes(slotStartTime, interverlTime);

            const scheduleData = {
                startDateTime: new Date(slotStartTime),
                endDateTime: new Date(slotEndTime),
            };

            const existingSchedule = await prisma.schedule.findFirst({
                where: { ...scheduleData },
            });

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData,
                });

                schedules.push(result);
            }

            slotStartTime = slotEndTime;
        }

        endTime = addDays(endTime, 1);

        startDate = addDays(startDate, 1);
        startDateTime = addDays(startDateTime, 1);
    }

    return schedules;
};

const getAllSchedules = async (query: TQueryObject<Schedule>, user: User) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const andConditions = [];

    if (query.startTime) {
        andConditions.push(
            Prisma.sql`"startDateTime"::time >= CAST(${query.startTime} AS time)`
        );
    }
    if (query.endTime) {
        andConditions.push(
            Prisma.sql`"startDateTime"::time < CAST(${query.endTime} AS time)`
        );
    }

    // Add conditions for startDate and endDate
    if (query.startDate) {
        andConditions.push(
            Prisma.sql`"startDateTime" >= CAST(${query.startDate} AS timestamp)`
        );
    }
    if (query.endDate) {
        andConditions.push(
            Prisma.sql`"startDateTime" <= CAST(${query.endDate} AS timestamp)`
        );
    }

    // Handle scheduleIdsToRemove for doctors
    if (user?.role === UserRole.DOCTOR) {
        const doctorSchedules = await prisma.doctorSchedule.findMany({
            where: {
                doctor: { email: user.email },
            },
        });
        const scheduleIdsToRemove = doctorSchedules.map(
            (doctorSchedule:any) => doctorSchedule.scheduleId
        );
        if (scheduleIdsToRemove.length) {
            andConditions.push(
                Prisma.sql`"id" NOT IN (${Prisma.join(scheduleIdsToRemove, ",")})`
            );
        }
    }

    // Default sortOrder
    !query.sortOrder && (query.sortOrder = "desc");

    const whereClause =
        andConditions.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(andConditions, " AND ")}`
            : Prisma.empty;

    const schedules = await prisma.$queryRaw`
        SELECT *
        FROM "Schedule"
        ${whereClause}
        ORDER BY "startDateTime" ${
            query.sortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`
        }
        OFFSET ${(page - 1) * limit}
        LIMIT ${limit}`;

    const totalResult = await prisma.$queryRaw`
        SELECT COUNT(*)
        FROM "Schedule"
        ${whereClause}`;

    const totalCount = (totalResult as { count: number }[])[0]?.count;
    const total =
        typeof totalCount === "bigint" ? Number(totalCount) : totalCount;

    return {
        data: schedules,
        meta: {
            page,
            limit,
            total: total, // Ensure total is a number or string
            totalPages: Math.ceil(Number(total) / limit),
        },
    };
};

// delete schedule --------------------------------------------------------------------------------
const deleteSchedule = async (scheduleIds: string[]) => {
    const schedules = await prisma.schedule.findMany({
        where: {
            id: {
                in: scheduleIds,
            },
        },
    });

    const notFoundSchedule = scheduleIds?.filter(
        (id) => !schedules?.find((schedule:any) => schedule?.id === id)
    );

    if (notFoundSchedule.length) throw new AppError(400, "schedule not found");

    const appointments = await prisma.appointment.findMany({
        where: {
            scheduleId: {
                in: scheduleIds,
            },
        },
    });

    if (
        appointments.length &&
        appointments.some((appointment:any) => appointment.status !== "COMPLETED")
    ) {
        throw new AppError(
            400,
            "Can't delete schedule, some appointments are booked for this schedule"
        );
    }

    const result = await prisma.$transaction(async (tx:any) => {
        if (appointments.length) {
            await tx.payment.deleteMany({
                where: {
                    appointmentId: {
                        in: appointments.map((appointment:any) => appointment.id),
                    },
                },
            });

            await tx.appointment.deleteMany({
                where: {
                    scheduleId: {
                        in: scheduleIds,
                    },
                },
            });
        }

        await tx.doctorSchedule.deleteMany({
            where: {
                scheduleId: {
                    in: scheduleIds,
                },
                doctorId: {
                    in: appointments.map((appointment:any) => appointment.doctorId),
                },
            },
        });

        await tx.schedule.deleteMany({
            where: {
                id: { in: scheduleIds },
            },
        });
    });

    return result;
};

// clean up schedules that are already ended and not booked by any appointments

// const cleanUpSchedules = async () => {
//     const schedules = await prisma.schedule.findMany();

//     const currentTime = new Date();

//     const schedulesToDelete = schedules.filter(
//         (schedule) => schedule.endDateTime < currentTime
//     );

//     if (schedulesToDelete.length) {
//         const scheduleIds = schedulesToDelete.map((schedule) => schedule.id);

//         const inCompleteAppointments = await prisma.appointment.findMany({
//             where: {
//                 scheduleId: {
//                     in: scheduleIds,
//                 },
//                 status: {
//                     not: "COMPLETED",
//                 },
//             },
//         });

//         const completedAppointments = await prisma.appointment.findMany({
//             where: {
//                 scheduleId: {
//                     in: scheduleIds,
//                 },
//                 status: "COMPLETED",
//             },
//         });

//         const scheduleIdsToDelete = scheduleIds.filter(
//             (scheduleId) =>
//                 !inCompleteAppointments.some(
//                     (appointment) => appointment.scheduleId === scheduleId
//                 )
//         );

//         await prisma.$transaction(async (tx) => {
//             await tx.doctorSchedule.deleteMany({
//                 where: {
//                     scheduleId: {
//                         in: scheduleIdsToDelete,
//                     },
//                 },
//             });

//             await tx.schedule.deleteMany({
//                 where: {
//                     id: {
//                         in: scheduleIdsToDelete,
//                     },
//                 },
//             });
//         });
//     }
// };

const cleanUpSchedules = async () => {
    const schedules = await prisma.schedule.findMany();

    const currentTime = new Date();

    const schedulesToDelete = schedules.filter(
        (schedule:any) => schedule.endDateTime < currentTime
    );

    if (schedulesToDelete.length) {
        const scheduleIds = schedulesToDelete.map((schedule:any) => schedule.id);

        const inCompleteAppointments = await prisma.appointment.findMany({
            where: {
                scheduleId: {
                    in: scheduleIds,
                },
                status: {
                    not: "COMPLETED",
                },
            },
        });

        // const completedAppointments = await prisma.appointment.findMany({
        //     where: {
        //         scheduleId: {
        //             in: scheduleIds,
        //         },
        //         status: "COMPLETED", // Only for cleanup
        //     },
        // });

        const scheduleIdsToDelete = scheduleIds.filter(
            (scheduleId:string) =>
                !inCompleteAppointments.some(
                    (appointment:any) => appointment.scheduleId === scheduleId
                )
        );

        await prisma.$transaction(async (tx:any) => {
            // if (completedAppointments.length) {
            //     const appointmentIdsToDelete = completedAppointments
            //         .filter((a:any) => scheduleIdsToDelete.includes(a.scheduleId))
            //         .map((a:any) => a.id);

            //     // Delete payments linked to those appointments
            //     await tx.payment.deleteMany({
            //         where: {
            //             appointmentId: {
            //                 in: appointmentIdsToDelete,
            //             },
            //         },
            //     });

            //     // Delete completed appointments themselves
            //     await tx.appointment.deleteMany({
            //         where: {
            //             id: {
            //                 in: appointmentIdsToDelete,
            //             },
            //         },
            //     });
            // }

            await tx.doctorSchedule.deleteMany({
                where: {
                    scheduleId: {
                        in: scheduleIdsToDelete,
                    },
                },
            });

            await tx.schedule.deleteMany({
                where: {
                    id: {
                        in: scheduleIdsToDelete,
                    },
                },
            });
        });
    }
};

export const ScheduleService = {
    createSchedule,
    getAllSchedules,
    deleteSchedule,
    cleanUpSchedules,
};
