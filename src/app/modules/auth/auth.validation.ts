import { z } from "zod";

const loginValidationSchema = z.object({
    email: z.string({ required_error: "Id is required." }).email(),
    password: z.string({ required_error: "Password is required" }),
});

const changePasswordZodSchema = z.object({
    oldPassword: z.string({
        required_error: "Old password  is required",
    }),
    newPassword: z.string({
        required_error: "New password  is required",
    }),
});

const refreshTokenZodSchema = z.object({
    cookies: z.object({
        refreshToken: z.string({
            required_error: "Refresh Token is required",
        }),
    }),
});

const resetPasswordZodSchema = z.object({
    id: z.string(),
    newPassword: z.string({
        required_error: "Password is required",
    }),
    token: z.string(),
});

export const authValidationSchema = {
    loginValidationSchema,
    changePasswordZodSchema,
    refreshTokenZodSchema,
    resetPasswordZodSchema,
};
