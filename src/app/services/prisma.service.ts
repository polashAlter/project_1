import AppError from "../errors/AppError";
import { User, UserRole, UserStatus } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
    errorFormat: "minimal",
});

// let prismaClient;

// if (process.env.NODE_ENV === "production") {
//     // In production (Vercel), use a global instance
//     if (!(global as any).prisma) {
//         (global as any).prisma = new PrismaClient();
//     }
//     prismaClient = (global as any).prisma;
// } else {
//     // In development, create a new instance each time
//     prismaClient = new PrismaClient();
// }

// export const prisma = prismaClient;

export const findUserByEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { email, status: "ACTIVE" },
    });
};

export const findUserById = async (id: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: { id, status: { not: "DELETED" } },
    });

    if (!user) throw new AppError(404, "User not found");

    return user;
};

export const existsById = async (
    Model: any,
    id: string,
    modelName = "Record",
    isDeletedFieldExists = true
) => {
    const result = await Model.findUnique({
        where: { id, ...(isDeletedFieldExists ? { isDeleted: false } : {}) },
    });

    if (!result) throw new AppError(404, `${modelName}  not found`);

    return result;
};

export const deleteUserById = async (
    modelName: string,
    id: string,
    referenceField: string = "email"
) => {
    return await prisma.$transaction(async (prismaClient: any) => {
        await existsById(prismaClient[modelName], id, modelName);

        const deletedRecord = await prismaClient[modelName].delete({
            where: { id },
        });

        await prismaClient.user.delete({
            where: { [referenceField]: deletedRecord[referenceField] },
        });

        return deletedRecord;
    });
};

export const softDeleteUserById = async (
    modelName: string,
    id: string,
    referenceField: string = "email"
) => {
    return await prisma.$transaction(async (prismaClient: any) => {
        await existsById(prismaClient[modelName], id, modelName);

        const softDeletedRecord = await prismaClient[modelName].update({
            where: { id },
            data: { isDeleted: true },
        });

        await prismaClient.user.update({
            where: { [referenceField]: softDeletedRecord[referenceField] },
            data: { status: UserStatus.DELETED },
        });

        return softDeletedRecord;
    });
};
