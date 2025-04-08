import { Router } from "express";

import { PaymentController } from "./payment.controller";



const router = Router();

// router.post(
//     "/init/:appointmentId",
//     checkAuth(UserRole.PATIENT),
//     paymentController.initPayment
// );


router.post("/success", PaymentController.sslSuccessCallback);

router.post("/fail", PaymentController.sslFailCallback);

router.post("/cancel", PaymentController.sslCancelCallback);

router.post("/ipn",  PaymentController.handleIpn);

export const paymentRoute = router;
