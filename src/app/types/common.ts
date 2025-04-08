/* eslint-disable @typescript-eslint/no-empty-object-type */

import {  UserRole } from "@prisma/client";


export interface IErrorIssue {
    path?: string;
    message: string;
    [key: string]: any;
}

export interface IGenericErrorResponse {
    statusCode: number;
    error: string;
    message: string;
    errorDetails: {
        issues: IErrorIssue[] | string;
        name: string;
    };
}

export type TQueryObject<T = {}> = {
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
    [key: string]: any;
} & Partial<T>;



export type TAuthUser = {
    userId: string;
    email: string;
    role: UserRole;
};

export type TChatMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: Date;
};
