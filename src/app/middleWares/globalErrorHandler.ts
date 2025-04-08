
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import handlerZodError from "../errors/handleZodEror";
import config from "../config";
import { Prisma } from "@prisma/client";
import handleValidationError from "../errors/handleValidationError";
import handleClientRequestError from "../errors/handleClientRequestError";
import { IGenericErrorResponse } from "../types/common";
import handlerAppError from "../errors/handleAppError";
import AppError from "../errors/AppError";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let errorResponse: IGenericErrorResponse = {
    statusCode: err.statusCode || 500,
    error: err.name || "Unknown Error",
    message: err.message || "Something went wrong",
    errorDetails: {
      name: err.name || "",
      issues: err.issues || [],
    },
  };

  if (err instanceof AppError) errorResponse = handlerAppError(err);

  if (err instanceof ZodError) errorResponse = handlerZodError(err);

  if (err instanceof Prisma.PrismaClientValidationError)
    errorResponse = handleValidationError(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError)
    errorResponse = handleClientRequestError(err);

  res.status(errorResponse.statusCode).json({
    success: false,
    error: errorResponse.error,
    message: errorResponse.message,

    ...(errorResponse.errorDetails.issues.length && {
      errorDetails: errorResponse.errorDetails,
    }),
    stack: config.NODE_ENV === "development" ? err.stack : undefined,
  });

  return;
};

export default globalErrorHandler;
