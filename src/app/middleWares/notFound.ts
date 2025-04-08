import { Request, Response } from "express";

const notFound = (req: Request, res: Response) => {
    console.error(
        `Api Not Found for__________________
        ____________________${req.originalUrl}`
    );

    res.status(404).json({
        status: "fail",
        message: `Api Not Found for ${req.originalUrl}`,
    });
};

export default notFound;
