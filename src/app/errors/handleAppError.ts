import { IGenericErrorResponse } from "../types/common";
import AppError from "../errors/AppError";

const handlerAppError = (err: AppError): IGenericErrorResponse => {
    return {
        statusCode: err.statusCode || 500,
        error: "Application Error",
        message: err.message,
        errorDetails: {
            name: (err.originalError as any)?.name || "",
            issues: (err.originalError as any)?.message || "",
        },
    };
};

export default handlerAppError;
