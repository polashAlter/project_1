import AppError from "../../errors/AppError";
import { processPassword } from "../../utls/passwordHash";

import { jwtToken, TJwtPayload } from "../../utls/jwtToken";
import config from "../../config";
import {
    findUserByEmail,
    findUserById,
    prisma,
} from "../../services/prisma.service";
import { User, UserRole } from "@prisma/client";
import emailSender from "../../services/emailSender";
import oauth2Client from "../../services/googleClient";
import axios from "axios";

// logIn......................logIn

const logIn = async (payload: { email: string; password: string }) => {
    const user = await findUserByEmail(payload.email);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    const plainPassword = payload.password;
    const hashedPassword = user.password;

    const isPasswordMatched = await processPassword.comparePassword(
        plainPassword,
        hashedPassword as string
    );

    if (!isPasswordMatched) throw new AppError(404, "Invalid password");

    const jwtPayload = {
        userId: user.id,
        role: user.role,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwtToken.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expiry
    );

    const refreshToken = jwtToken.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expiry
    );

    return {
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange,
    };
};

// changePassword....................changePassword
const changePassword = async (
    user: User,
    payload: { oldPassword: string; newPassword: string }
) => {
    const authUser = await findUserById(user.id);
   

    if (authUser?.authProvider !== "OWN")
        throw new AppError(
            400,
            `You have logged in via ${authUser?.authProvider}.Please change password from ${authUser?.authProvider} `
        );
    const isPasswordMatched = await processPassword.comparePassword(
        payload.oldPassword,
        user.password as string
    );
    if (!isPasswordMatched)
        throw new AppError(400, "Old Password Is Incorrect");

    const isOldAdnNewPasswordSame = await processPassword.comparePassword(
        payload.newPassword,
        user?.password as string
    );
    if (isOldAdnNewPasswordSame)
        throw new AppError(400, "New password can't be same as old password");

    const hashedPassword = await processPassword.hashPassword(
        payload.newPassword
    );

    const result = await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            needPasswordChange: false,
        },
    });

    return result;
};

const forgotPassword = async (email: string) => {
    const user = await findUserByEmail(email);
    if (!user) throw new AppError(404, "User not found");

    if (user.authProvider !== "OWN")
        throw new AppError(
            400,
            `You have logged in via ${user.authProvider}.Please reset password from ${user.authProvider} `
        );

    const resetPassToken = jwtToken.createToken(
        { id: user.id },
        config.resetPassword.reset_pass_secret,
        config.resetPassword.reset_link_expires_in
    );

    const resetLink: string =
        config.resetPassword.reset_link +
        `?id=${user.id}&token=${resetPassToken}`;

    await emailSender(
        email,
        `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
              <p>Dear ${user.role},</p>
              <p>Your password reset link:</p>
              <a href="${resetLink}" style="text-decoration: none;">
                <button style="cursor: pointer; padding: 10px 20px; background-color: #007BFF; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                  RESET PASSWORD
                </button>
              </a>
              <p>Thank you,</p>
              <p>Netra Health Care</p>
            </div>
          `
    );
};

const resetPassword = async (payload: {
    id: string;
    token: string;
    newPassword: string;
}) => {
    const user = (await findUserById(payload.id)) as User;

    const isTokenValid = jwtToken.verifyToken(
        payload.token,
        config.resetPassword.reset_pass_secret,
        "Reset Password Link"
    );

    if (!isTokenValid) throw new AppError(401, "Something went wrong");

    const hashedPassword = await processPassword.hashPassword(
        payload.newPassword
    );

    const result = await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
        },
    });

    return result;
};

const refresh = async (refreshToken: string) => {
    const verifiedToken: TJwtPayload = jwtToken.verifyToken(
        refreshToken,
        config.jwt_refresh_secret,
        "Refresh Token"
    );

    if (!verifiedToken.userId) throw new AppError(403, "invalid refresh token");

    const user = await findUserById(verifiedToken.userId);

    const jwtPayload = {
        userId: user?.id,
        role: user?.role,
        email: user?.email,
        iat: Math.floor(Date.now() / 1000),
    };

    const newAccessToken = jwtToken.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expiry
    );

    return {
        accessToken: newAccessToken,
    };
};

const LoginWithGoogle = async (clientRedirectRoute: string) => {
    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ],
        prompt: "consent",
        state: clientRedirectRoute,
    });

    return authorizeUrl;
};

const googleCallback = async (code: string) => {
    let user: User | null = null;

    try {
        const googleRes = await oauth2Client.getToken(code);

        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        // user = userRes.data;

        const { email, picture, name } = userRes.data;

        const existingUser = await findUserByEmail(email);
        user = existingUser;

        if (!existingUser) {
            user = await prisma.$transaction(async (transactionClient:any) => {
                const newUser = await transactionClient.user.create({
                    data: {
                        email,
                        role: UserRole.PATIENT,
                        needPasswordChange: false,
                        authProvider: "GOOGLE",
                    },
                });

                await transactionClient.patient.create({
                    data: {
                        name,
                        email,
                        profilePhoto: picture,
                    },
                });

                return newUser;
            });
        }
    } catch (err) {
        console.log(err, "error in google callback authservice");
    }

    if (user) {
        const jwtPayload = {
            userId: user.id,
            role: user.role,
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
        };

        const accessToken = jwtToken.createToken(
            jwtPayload,
            config.jwt_access_secret,
            config.jwt_access_expiry
        );
        const refreshToken = jwtToken.createToken(
            jwtPayload,
            config.jwt_refresh_secret,
            config.jwt_refresh_expiry
        );

        return {
            accessToken,
            refreshToken,
        };
    }
    return null;
};

export const authServices = {
    logIn,
    changePassword,
    forgotPassword,
    resetPassword,
    refresh,
    LoginWithGoogle,
    googleCallback,
};
