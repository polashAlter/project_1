import { Router } from "express";

import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.routes";
import { adminRoutes } from "../modules/admin/admin.router";
import { specialtyRoutes } from "../modules/specialty/specialty.routes";
import { doctorRoutes } from "../modules/doctor/doctor.router";
import { scheduleRoutes } from "../modules/schedule/schedule.route";
import { doctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.route";
import { paymentRoute } from "../modules/payment/payment.route";
import { AppointmentRouter } from "../modules/appointment/appointment.route";
import { prescriptionRoutes } from "../modules/prescription/prescription.router";
import { ReviewRoutes } from "../modules/review/reviewrouter";
import { MetaRoutes } from "../modules/meta/meta.route";
import { patientRouter } from "../modules/patient/patient.route";
import { ChatRouter } from "../modules/chat/chat.route";

const router = Router();

router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/admin", adminRoutes);

router.use("/specialty", specialtyRoutes);

router.use("/doctor", doctorRoutes);

router.use("/patient", patientRouter);

router.use("/schedule", scheduleRoutes);

router.use("/doctor-schedule", doctorScheduleRoutes);

router.use("/appointment", AppointmentRouter);

router.use("/payment", paymentRoute);

router.use("/prescription", prescriptionRoutes);

router.use("/review", ReviewRoutes);

router.use("/metaData", MetaRoutes);

router.use("/chat", ChatRouter);

export default router;
