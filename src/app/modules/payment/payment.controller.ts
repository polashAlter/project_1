import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { PaymentService } from "./payment.service";

// const validatePayment = catchAsync(async (req, res) => {
//     const result = await PaymentService.validatePayment(req.query);

//     sendSuccessResponse(res, result, "payment succfull");
// });

const sslSuccessCallback = catchAsync(async (req, res) => {
    const result = await PaymentService.sslSuccessCallback(req.body);

    res.redirect(result);
});

const sslFailCallback = catchAsync(async (req, res) => {
    const result = await PaymentService.sslFailCallback(req.body);

    res.redirect(result);
});

const sslCancelCallback = catchAsync(async (req, res) => {
    const result = await PaymentService.sslCancelCallback(req.body);

    res.redirect(result);
});

const handleIpn = catchAsync(async (req, res) => {
    await PaymentService.handleIpn(req.query);

    sendSuccessResponse(res, "", "IPN data received");
});

export const PaymentController = {
    sslSuccessCallback,
    sslFailCallback,
    sslCancelCallback,
    handleIpn,
};
