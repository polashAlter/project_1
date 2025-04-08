import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import globalErrorHandler from "./app/middleWares/globalErrorHandler";
import notFound from "./app/middleWares/notFound";
import { AppointmentService } from "./app/modules/appointment/appointment.service";
import cron from "node-cron";

import { ScheduleService } from "./app/modules/schedule/schedule.service";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./app/services/prisma.service";
import { configureSocket } from "./sockets/socket";
import config from "./app/config";

const app: Application = express();

console.log("client url", config.client_url);

app.use(
    cors({
        origin: [
            config.client_url as string,
            // "http://localhost:3000",
        ],
        credentials: true,
    })
);

export const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: config.client_url,
        methods: ["GET", "POST"],
    },
});
configureSocket();

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded used in sslCommerz

app.use("/api/v1", router);

cron.schedule("*/10 * * * *", async (): Promise<void> => {
    try {
        // await AppointmentService.cleanUnpaidAppointments();
        await ScheduleService.cleanUpSchedules();
    } catch (error) {
        console.error(error);
    }
});

app.use(globalErrorHandler);

app.get("/", (req: Request, res: Response) => {
    res.send("server is running");
});
app.use(notFound);

export default app;
