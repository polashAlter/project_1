import { Prisma } from "@prisma/client";
import { IGenericErrorResponse } from "../types/common";

const handleValidationError = (
  error: Prisma.PrismaClientValidationError,
): IGenericErrorResponse => {
  console.log(error.message, "error in prisma validation error.................");

  return {
    statusCode: 400,
    error: "Validation Error",
    message: error.message,
    errorDetails: {
      name: error.name,
      issues: [{ message: error.message }],
    },
  };
};

export default handleValidationError;
