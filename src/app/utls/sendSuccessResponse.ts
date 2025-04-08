import { Response } from "express";

export type TMetaData = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

const sendSuccessResponse = (
    res: Response,
    data: any,
    message: string,
    statusCode: number = 200,
    meta?: TMetaData
) => {
    const responseData = {
        success: true,
        statusCode: statusCode,
        message: message,
        data: data?.data || data,
        meta: data?.meta || meta || undefined,
    };
    console.log(message);
    return res.status(statusCode).json(responseData);
};

export default sendSuccessResponse;
