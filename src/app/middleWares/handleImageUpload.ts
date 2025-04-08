import { NextFunction, Request, Response } from "express";

import multer from "multer";


const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

export const handleImageUpload = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //using multer memory storage to create a buffer of the image

    const uploadMiddleware = upload.single("file");

    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.log(err, "error in handle image.......");
            return next(err);
        }

        if (typeof req.body.data === "string") {
            try {
                req.body.data = JSON.parse(req.body.data);
            } catch (parseError) {
                console.log(parseError, "parseError in handle image.......");
                return next(parseError);
            }
        }

        next();
    });
};
