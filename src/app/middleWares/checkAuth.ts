import AppError from "../errors/AppError";

import catchAsync from "../utls/catchAsync";
import { jwtToken } from "../utls/jwtToken";
import config from "../config";
import { User, UserRole } from "@prisma/client";
import { prisma } from "../services/prisma.service";

const checkAuth = (...requiredRoles: Array<UserRole>) => {
    return catchAsync(async (req, res, next) => {
        const token = req.cookies.accessToken || req.headers.authorization;

        if (!token) {
            throw new AppError(401, "You are not authenticated !");
        }

        const decodedToken = jwtToken.verifyToken(
            token,
            config.jwt_access_secret as string,
            "Access Token"
        );

        const { userId, role } = decodedToken;

        // checking if the user is exist
        const user = (await prisma.user.findUnique({
            where: { id: userId },
        })) as User;

        if (!user) throw new AppError(404, "User is not found !");

        if (user.status === "BLOCKED")
            throw new AppError(403, "This user is blocked !");

        if (user.status === "DELETED")
            throw new AppError(403, "User is deleted !");

        if (
            requiredRoles &&
            !requiredRoles.includes(role as UserRole) &&
            role !== UserRole.SUPER_ADMIN
        ) {
            throw new AppError(401, `${role} is not allowed for this action`);
        }

        

        req.user = user;

        next();
    });
};

export default checkAuth;
