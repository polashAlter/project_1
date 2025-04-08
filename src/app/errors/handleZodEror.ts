
import { ZodError } from "zod";
import { IErrorIssue, IGenericErrorResponse } from "../types/common";

const handlerZodError = (err: ZodError): IGenericErrorResponse => {
    console.log(err , 'err in zod error handle ---------------');
    const errorIssues: IErrorIssue[] = err.issues.map((issue) => {
        if (issue?.message === "Required")
            issue.message = `${issue?.path[0]} is required`;

        return {
            path: issue.path[issue.path.length - 1]?.toString() || "",
            message: issue.message,
            code: issue.code,
            expected: "expected" in issue ? issue.expected : undefined,
            received: "received" in issue ? issue.received : undefined,
        };
    });

    return {
        statusCode: 400,
        error: "Zod Validation Error",
        message: errorIssues.map((value: any) => value.message).join(",  "),
        errorDetails: {
            name: err.name,
            issues: errorIssues,
        },
    };
};

export default handlerZodError;
