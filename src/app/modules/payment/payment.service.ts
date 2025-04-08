import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../services/prisma.service";
import { sslService } from "../../services/sslCommerz";
import config from "../../config";

const sslSuccessCallback = async (sslData: any) => {
    if (!sslData || !sslData.val_id) {
        console.error("Invalid SSL data received:", sslData);
        return `${config.client_url}/payment?status=failed`;
    }

    const validatedData = await sslService.validate(sslData.val_id);

    if (validatedData?.status !== "VALID" || !validatedData.tran_id) {
        console.error("Validation failed:", validatedData);
        return `${config.client_url}/payment?status=failed`;
    }

    console.info("Validation succeeded. Processing paid payment...");

    const payment = await prisma.payment.findUnique({
        where: { transactionId: validatedData.tran_id },
    });

    if (!payment) {
        console.warn(
            "Payment not found for this _______PAID________ transaction ID:",
            validatedData.tran_id
        );
        return `${config.client_url}/payment?status=error`;
    }

    await prisma.$transaction(async (transactionClient: any) => {
        const paymentData = await transactionClient.payment.update({
            where: { transactionId: validatedData.tran_id },
            data: { status: PaymentStatus.PAID },
        });

        await transactionClient.appointment.update({
            where: {
                id: paymentData.appointmentId,
            },
            data: {
                status: AppointmentStatus.SCHEDULED,
                paymentStatus: PaymentStatus.PAID,
            },
        });
    });

    return `${config.client_url}/payment?status=success`;
};

//  ssl fail callback.......................................................................................
const sslFailCallback = async (sslData: any, status = "failed") => {
    if (!sslData?.tran_id) {
        console.error("Invalid SSL data from fail callback:", sslData);
        return `${config.client_url}/payment?status=${status}`;
    }

    const payment = await prisma.payment.findUnique({
        where: {
            transactionId: sslData.tran_id,
        },
    });

    if (!payment) {
        console.warn("Payment not found for transaction ID:", sslData.tran_id);
        return `${config.client_url}/payment?status=${status}`;
    }

    const appointment = await prisma.appointment.findUnique({
        where: {
            id: payment.appointmentId,
        },
    });

    if (!appointment) {
        console.warn("Appointment not found for payment ID:", payment.id);
        return `${config.client_url}/payment?status=${status}`;
    }

    await prisma.$transaction(async (tx: any) => {
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

        await tx.payment.delete({
            where: { id: payment.id },
        });

        await tx.appointment.delete({
            where: { id: appointment.id },
        });

        console.info(
            "deleted appointment and payment and updated doctor schedule"
        );
    });

    return `${config.client_url}/payment?status=${status}`;
};

// ssl cancel callback.......................................................................................

const sslCancelCallback = async (sslData: any) => {
    return sslFailCallback(sslData, "cancelled");
};

// handle ipn listener..................................................................................

const handleIpn = async (ipnData: any) => {
    console.log("IPN data received:::::::::::::", ipnData);

    if (!ipnData?.tran_id || !ipnData?.status) {
        console.error("Invalid IPN data received:", ipnData);
        return;
    }

    const payment = await prisma.payment.findUnique({
        where: { transactionId: ipnData.tran_id },
    });

    if (!payment) {
        console.log(
            "Payment record not found for transaction ID:",
            ipnData.tran_id
        );
        return;
    }

    if (payment.status === PaymentStatus.PAID) {
        console.log(
            "IPN received for already processed payment:",
            ipnData.tran_id
        );
        return;
    }

    if (ipnData?.status === "VALID") {
        await sslSuccessCallback(ipnData);
        console.info("Payment succeeded in IPN:", ipnData);
    } else {
        await sslCancelCallback(ipnData);
        console.error("Payment cancelled in IPN:", ipnData);
    }

    return;
};

export const PaymentService = {
    sslSuccessCallback,
    sslFailCallback,
    sslCancelCallback,
    handleIpn,
};
