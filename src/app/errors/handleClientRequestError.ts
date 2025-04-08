import { Prisma } from "@prisma/client";
import { IGenericErrorResponse } from "../types/common";

const handleClientRequestError = (
  error: Prisma.PrismaClientKnownRequestError,
): IGenericErrorResponse => {
  const errorIssues = [];
  let path = "";
  let message = "";

  if (error.code === "P2002") {
    // Unique constraint violation
    const target = (error.meta?.target as string[]) || [];

    path = target.join(", ");
    message =
      (error.meta?.cause as string) ||
      `Unique constraint failed on the fields: ${target.join(", ")}`;

    errorIssues.push({ path, message });
  } else if (error.code === "P2003") {
    // Foreign key constraint violation
    path = "foreign_key";
    message =
      (error.meta?.cause as string) ||
      "Foreign key constraint failed. Referenced record not found.";

    errorIssues.push({ path, message });
  } else if (error.code === "P2025") {
    message = (error.meta?.cause as string) || "Record not found!";

    errorIssues.push({ path, message });
  } else {
    // Generic message for other known errors
    message =
      (error.meta?.cause as string) ||
      error.message ||
      "An unknown Prisma error occurred.";

    errorIssues.push({ path, message });
  }

  return {
    statusCode: 400,
    error: "Prisma Known Error",
    message: errorIssues.map((issue) => issue.message).join(" "),
    errorDetails: {
      name: error.name,
      issues: errorIssues,
    },
  };
};

export default handleClientRequestError;
