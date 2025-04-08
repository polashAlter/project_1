import { DoctorSchedule, Schedule, User } from "@prisma/client";
import { TDoctorSchedulePayload } from "./doctorSchedule.validation";
import {

    prisma,
} from "../../services/prisma.service";
import AppError from "../../errors/AppError";
import getAllItems from "../../utls/getAllItems";
import {  TQueryObject } from "../../types/common";

const createDoctorSchedule = async (
    user: User,
    payload: TDoctorSchedulePayload
) => {
    const doctor = await prisma.doctor.findUnique({
        where: { email: user.email },
    });
    if (!doctor) throw new AppError(404, "Doctor not found!");

    const { scheduleIds } = payload;

    const doctorScheduleData = scheduleIds.map((scheduleId) => ({
        doctorId: doctor.id,
        scheduleId,
    }));

    console.log(doctorScheduleData, "doctorScheduleData........");

    const doctorSchedules = await prisma.doctorSchedule.createMany({
        data: doctorScheduleData,
        skipDuplicates: true,
    });

    return doctorSchedules;
};

// get my schedules.................................................................................
const getMySchedules = async (user: User, query: TQueryObject) => {
    const andConditions = [];

    if (query.isBooked && typeof query.isBooked === "string") {
        const isBookedBoolean = query.isBooked === "true";
        query.isBooked = isBookedBoolean;
    }

    andConditions.push({ doctor: { email: user.email } });

    if (query.startDate) {
        andConditions.push({
            schedule: { startDateTime: { gte: query.startDate } },
        });
        delete query.startDate;
    }

    if (query.endDate) {
        andConditions.push({
            schedule: { endDateTime: { lte: query.endDate } },
        });
        delete query.endDate;
    }

    if (query.sortBy) delete query.sortBy;
    const orderBy = {
        schedule: {
            startDateTime: query?.sortOrder || "desc",
        },
    };

    const result = await getAllItems<DoctorSchedule & { schedule: Schedule }>(
        prisma.doctorSchedule,
        query,
        {
            filterableFields: ["isBooked"],
            andConditions: andConditions,
            include: { schedule: true },
            orderBy: orderBy as any,
            isDeletedCondition: false,
        }
    );

    return result;
};

// get all doctor schedules...........................................................................
const getDoctorSchedules = async (query: TQueryObject) => {
    if (query.isBooked && typeof query.isBooked === "string") {
        const isBookedBoolean = query.isBooked === "true";
        query.isBooked = isBookedBoolean;
    }

    const orderBy = {
        schedule: {
            startDateTime: query?.sortOrder || "asc",
        },
    };
    if (query.sortBy) delete query.sortBy;

    if (query.startDate || query.endDate) {
        query.schedule = {
            ...(query.startDate && { startDateTime: { gte: query.startDate } }),
            ...(query.endDate && { endDateTime: { lte: query.endDate } }),
        };
    }

    delete query.startDate;
    delete query.endDate;


    const result = await getAllItems<DoctorSchedule & { schedule: Schedule }>(
        prisma.doctorSchedule,
        query,
        {
            filterableFields: ["schedule", "doctorId", "isBooked"],
            include: { schedule: true },
            orderBy: orderBy as any,
            isDeletedCondition: false,
        }
    );

    return result;
};

// delete doctor schedule.............................................................................
const deleteDocotrSchedule = async (user: User, scheduleId: string) => {
    const doctor = await prisma.doctor.findUnique({
        where: { email: user.email },
    });
    if (!doctor) throw new AppError(404, "Doctor not found!");

    const doctorSchedule = await prisma.doctorSchedule.findUnique({
        where: {
            doctorId_scheduleId: {
                doctorId: doctor.id,
                scheduleId: scheduleId,
            },
        },
    });

    if (!doctorSchedule) throw new AppError(404, "Doctor schedule not found");

    // const isBookedScheduled = await prisma.doctorSchedule.findFirst({
    //     where: {
    //         doctorId: doctor.id,
    //         scheduleId: scheduleId,
    //         isBooked: true,
    //     }
    // });

    const appointment = await prisma.appointment.findFirst({
        where: {
            scheduleId: scheduleId,
            doctorId: doctor.id,
            status: {
                not: "COMPLETED",
            },
        },
    });

    if (appointment) {
        throw new AppError(
            400,
            "At least one appointment booked for this schedule and not completed yet"
        );
    }

    const result = await prisma.doctorSchedule.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: doctor.id,
                scheduleId: scheduleId,
            },
        },
    });

    return result;
};

export const DoctorScheduleService = {
    createDoctorSchedule,
    getMySchedules,
    getDoctorSchedules,
    deleteDocotrSchedule,
};
