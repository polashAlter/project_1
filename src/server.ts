

import { httpServer } from "./app";
import config from "./app/config";


async function bootstrap() {
    try {
        httpServer.listen(config.port, () => {
            console.info(`Server running on port ${config.port}`);
        });

        const exitHandler = () => {
            httpServer.close(() => {
                console.info("Server closed");
                process.exit(1);
            });
        };

        const unexpectedErrorHandler = (error: unknown) => {
            console.error(error);
            exitHandler();
        };

        process.on("uncaughtException", unexpectedErrorHandler);
        process.on("unhandledRejection", unexpectedErrorHandler);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

bootstrap();
