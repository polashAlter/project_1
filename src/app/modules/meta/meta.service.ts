import { Sql } from "@prisma/client/runtime/library";
import { findUserByEmail, prisma } from "../../services/prisma.service";
import { allMonths } from "./meta.constant";
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    startOfDay,
    endOfDay,
    eachHourOfInterval,
    subDays,
    subMonths,
} from "date-fns";
import { User, UserRole } from "@prisma/client";
import AppError from "../../errors/AppError";
import { TQueryObject } from "../../types/common";

const getDashboardMetaData = async (user: User) => {
    const doctor = await prisma.doctor.findUnique({
        where: {
            email: user?.email,
        },
    });

    if (user?.role === UserRole.DOCTOR && !doctor) {
        throw new AppError(404, "User not found");
    }

    const appointmentCount = await prisma.appointment.count({
        where: {
            ...(user?.role === UserRole.DOCTOR && {
                doctorId: doctor?.id,
            }),
        },
    });
    const patientCount = await prisma.patient.count();

    const patientCountForDoctor = await prisma.appointment
        .groupBy({
            by: ["patientId"],
            where: {
                doctorId: doctor?.id,
            },
            _count: {
                patientId: true,
            },
        })
        .then((result:any) => result?.length);

    const doctorCount = await prisma.doctor.count();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: "PAID",
            ...(user?.role === UserRole.DOCTOR && {
                appointment: {
                    doctorId: doctor?.id,
                },
            }),
        },
    });

    const appointmnetsGroupByStatus = await prisma.appointment.groupBy({
        by: ["status"],
        _count: true,
        ...(user?.role === UserRole.DOCTOR && {
            where: {
                doctorId: doctor?.id,
            },
        }),
    });

    const appointmentsPieData = appointmnetsGroupByStatus.map((data:any) => {
        return {
            status: data.status,
            count: Number(data._count),
        };
    });

    return {
        appointmentCount,
        patientCount:
            user?.role === UserRole.DOCTOR
                ? patientCountForDoctor
                : patientCount,

        ...(user?.role !== UserRole.DOCTOR && {
            doctorCount,
        }),
        totalRevenue: totalRevenue._sum.amount || 0,
        appointmentsPieData,
    };
};

//get bar chart data ................................................................................
const getBarChartData = async (query: TQueryObject, user: User) => {
    let doctor;
    if (user?.role === UserRole.DOCTOR) {
        doctor = await prisma.doctor.findUnique({
            where: {
                email: user?.email,
            },
        });
    }

    if (user?.role === UserRole.DOCTOR && !doctor)
        throw new AppError(404, "User not found");

    const periodMapping = {
        lastYear: {
            trunc: "month",
            filter: `a."createdAt" >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'`,
        },
        lastMonth: {
            trunc: "day",
            filter: `a."createdAt" >= (CURRENT_DATE - INTERVAL '30 days') 
                     AND a."createdAt" < CURRENT_DATE`,
        },
        lastWeek: {
            trunc: "day",
            filter: `a."createdAt" >= (CURRENT_DATE - INTERVAL '7 days') 
                     AND a."createdAt" < CURRENT_DATE`,
        },
        today: {
            trunc: "hour",
            filter: `DATE(a."createdAt") = CURRENT_DATE`,
        },
    };

    const selectedPeriod: keyof typeof periodMapping =
        query?.queryPeriod || "lastYear";
    const periodInfo = periodMapping[selectedPeriod];

    if (!periodInfo) {
        throw new Error("Invalid period specified");
    }

    // Execute the database query with the appropriate filter
    const appointmentGroupedData: {
        period: string;
        appointment_count: number;
        doctor_count: number;
        patient_count: number;
    }[] = await prisma.$queryRawUnsafe(`
        SELECT 
        DATE_TRUNC('${periodInfo.trunc}', a."createdAt") AS period,
        COUNT(*) AS appointment_count,
        COUNT(DISTINCT a."doctorId") AS doctor_count,
        COUNT(DISTINCT a."patientId") AS patient_count
        FROM "Appointment" a
        WHERE ${periodInfo.filter}
        ${user?.role === UserRole.DOCTOR ? `AND a."doctorId" = '${doctor?.id}'` : ""}
        GROUP BY period
        ORDER BY period ASC;
    `);

    // Generate periods dynamically
    const allPeriods = {
        lastYear: Array.from({ length: 12 }, (_, index) =>
            format(subMonths(new Date(), 11 - index), "MMM")
        ),
        lastMonth: eachDayOfInterval({
            start: subDays(new Date(), 30),
            end: subDays(new Date(), 1),
        }).map((date) => format(date, "MMM dd")), // Format as "Nov 03"
        lastWeek: eachDayOfInterval({
            start: subDays(new Date(), 7),
            end: subDays(new Date(), 1),
        }).map((date) => format(date, "EEE")), // Format as day name (e.g., "Mon")
        today: eachHourOfInterval({
            start: startOfDay(new Date()),
            end: endOfDay(new Date()),
        }).map((hour) => `${format(hour, "HH")}:00`), // Format as "HH:00"
    };

    const periods = allPeriods[selectedPeriod];

    const appointmentsBarChartData = periods.map((period) => {
        const periodData = appointmentGroupedData.find((data) => {
            const dataDate = new Date(data.period);
            if (selectedPeriod === "lastYear") {
                return format(dataDate, "MMM") === period;
            } else if (selectedPeriod === "lastMonth") {
                return format(dataDate, "MMM dd") === period;
            } else if (selectedPeriod === "lastWeek") {
                return format(dataDate, "EEE") === period;
            } else if (selectedPeriod === "today") {
                return format(dataDate, "HH:00") === period;
            }
            return false;
        });

        return {
            period,
            appointments: Number(periodData?.appointment_count) || 0,
            ...(user?.role !== UserRole.DOCTOR && {
                doctors: Number(periodData?.doctor_count) || 0,
            }),
            patients: Number(periodData?.patient_count) || 0,
        };
    });

    return appointmentsBarChartData;
};

// revenue line chart data ................................................................................

const revenueLineChartData = async (query: TQueryObject) => {
    console.log(query, "queryllll");
    const periodMapping = {
        lastYear: {
            trunc: "month",
            filter: `WHERE p."createdAt" >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'`,
        },
        lastMonth: {
            trunc: "day",
            filter: `WHERE p."createdAt" >= (CURRENT_DATE - INTERVAL '30 days') 
                     AND p."createdAt" < CURRENT_DATE`,
        },
        lastWeek: {
            trunc: "day",
            filter: `WHERE p."createdAt" >= (CURRENT_DATE - INTERVAL '7 days') 
                     AND p."createdAt" < CURRENT_DATE`,
        },
        today: {
            trunc: "hour",
            filter: `WHERE DATE(p."createdAt") = CURRENT_DATE`,
        },
    };

    const selectedPeriod: keyof typeof periodMapping =
        query?.queryPeriod || "lastYear";
    const periodInfo = periodMapping[selectedPeriod];

    if (!periodInfo) {
        throw new Error("Invalid period specified");
    }

    // Execute the database query with the appropriate filter
    const revenueGroupedData: { period: string; total_amount: number }[] =
        await prisma.$queryRawUnsafe(`
        SELECT 
        DATE_TRUNC('${periodInfo.trunc}', p."createdAt") AS period,
        COALESCE(SUM(p.amount), 0) AS total_amount
        FROM "Payment" p
        ${periodInfo.filter}
        GROUP BY period
        ORDER BY period ASC;
    `);

    // Generate periods dynamically
    const allPeriods = {
        lastYear: Array.from({ length: 12 }, (_, index) =>
            format(subMonths(new Date(), 11 - index), "MMM")
        ),
        lastMonth: eachDayOfInterval({
            start: subDays(new Date(), 30),
            end: subDays(new Date(), 1),
        }).map((date) => format(date, "MMM dd")), // Format as "Nov 03"
        lastWeek: eachDayOfInterval({
            start: subDays(new Date(), 7),
            end: subDays(new Date(), 1),
        }).map((date) => format(date, "EEE")), // Format as day name (e.g., "Mon")
        today: eachHourOfInterval({
            start: startOfDay(new Date()),
            end: endOfDay(new Date()),
        }).map((hour) => `${format(hour, "HH")}:00`), // Format as "HH:00"
    };

    const periods = allPeriods[selectedPeriod];

    const revenueLineChartData = periods.map((period) => {
        const periodData = revenueGroupedData.find((data) => {
            const dataDate = new Date(data.period);
            if (selectedPeriod === "lastYear") {
                return format(dataDate, "MMM") === period;
            } else if (selectedPeriod === "lastMonth") {
                return format(dataDate, "MMM dd") === period;
            } else if (selectedPeriod === "lastWeek") {
                return format(dataDate, "EEE") === period;
            } else if (selectedPeriod === "today") {
                return format(dataDate, "HH:00") === period;
            }
            return false;
        });

        return {
            period,
            totalAmount: Number(periodData?.total_amount) || 0,
        };
    });

    // console.log(revenueLineChartData, "revenueLineChartData");
    return revenueLineChartData;
};

export const MetaService = {
    getDashboardMetaData,
    getBarChartData,
    revenueLineChartData,
};
