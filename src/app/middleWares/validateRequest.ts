import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import catchAsync from "../utls/catchAsync";

const validateRequest = (schema: AnyZodObject) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            if (req.body.data) {
                await schema.parseAsync(req.body.data);
            } else {
                await schema.parseAsync(req.body);
            }

            // await schema.parseAsync(req.body);

            next();
        }
    );
};

export default validateRequest;
