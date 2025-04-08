import config from "../config";
import AppError from "../errors/AppError";
// @ts-expect-error: SSLCommerzPayment does not have type definitions
import SSLCommerzPayment from "sslcommerz-lts";
import { Patient, Payment } from "@prisma/client";

const sslcmz = new SSLCommerzPayment(
    config.ssl.storeId,
    config.ssl.storePass,
    config.ssl.is_live === "true"
);

const initPayment = async (paymentData: Payment, user: Patient) => {
    try {
        const data = {
            store_id: config.ssl.storeId,
            store_passwd: config.ssl.storePass,
            total_amount: paymentData.amount,
            currency: "BDT",
            tran_id: paymentData.transactionId,
            success_url: `${config.base_url}/payment/success`,
            fail_url: `${config.base_url}/payment/fail`,
            cancel_url: `${config.base_url}/payment/cancel`,
            ipn_url: `${config.base_url}/payment/ipn`,
            cus_name: user.name,
            cus_email: user.email,
            cus_add1: user.address || null,
            // cus_country: null,
            cus_phone: user.contactNumber || "dummy",
            shipping_method: "NO",
            product_name: "dummy",
            product_category: "dummy",
            product_profile: "dummy",

            // ship_name: "Customer Name",
            // ship_add1: "Dhaka",
            // ship_add2: "Dhaka",
            // ship_city: "Dhaka",
            // ship_state: "Dhaka",
            // ship_postcode: 1000,
            // ship_country: "Bangladesh",
        };

        const response = await sslcmz.init(data);

        if (response.status !== "SUCCESS") {
            throw new AppError(400, "Payment error", response);
        }

        return response;
    } catch (err) {
        throw new AppError(400, "Payment error", err);
    }
};

const validate = async (val_id: string) => {
    try {
        const response = await sslcmz.validate({ val_id });

        return response;
    } catch (err) {
        throw new AppError(400, "Payment error", err);
    }
};

export const sslService = {
    initPayment,
    validate,
};
