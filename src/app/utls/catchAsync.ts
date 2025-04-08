import { User } from "@prisma/client";
import { NextFunction, Request, RequestHandler, Response } from "express";


declare module "express-serve-static-core" {
    interface Request {
        user: User;
    }
}

const catchAsync = (fn: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.log(
                err,
                err?.name || `error`,
                " in catchAsync"
            );
            next(err);
        });
    };
};
export default catchAsync;
