import { Admin, User } from "@prisma/client";
import { TQueryObject } from "../../types/common";
import getAllItems from "../../utls/getAllItems";

import {
    deleteUserById,
    existsById,
    prisma,
    softDeleteUserById,
} from "../../services/prisma.service";
import { sendImageToCloudinary } from "../../services/sendImageToCloudinary";
import sharp from "sharp";

const getAllLAdmin = async (query: TQueryObject) => {
    const result = await getAllItems<Admin & { user: User }>(
        prisma.admin,
        query,
        {
            searchableFields: ["name", "email"],
            filterableFields: ["name", "user"],
            include: { user: { select: { role: true } } },
        }
    );

    const admins =
        result.data.map((item) => {
            return {
                ...item,
                role: item.user.role,
            };
        }) || [];

    return admins;
};

const getAdminById = async (id: string) => {
    const result = await existsById(prisma.admin, id, "Admin");
    return result;
};

const updateAdmin = async (
    adminId: string,
    payload: Partial<Admin>,
    file: any
) => {
    await existsById(prisma.admin, adminId, "Admin");

    if (!payload) payload = {};

    if (file) {
        const optimizedBuffer = await sharp(file.buffer)
            .resize({ width: 320 })
            .webp({ quality: 80 })
            .toBuffer();

        const uploadedImage = await sendImageToCloudinary(
            `admin-${adminId}`,
            // file?.buffer
            optimizedBuffer
        );

        payload.profilePhoto = uploadedImage?.secure_url;
    }

    const result = await prisma.admin.update({
        where: { id: adminId },
        data: payload,
    });

    return result;
};

const deleteAdmin = async (id: string) => {
    const deletedAdmin = await deleteUserById("admin", id);
    return deletedAdmin;
};

const softDelete = async (id: string) => {
    const deletedAdmin = await softDeleteUserById("admin", id);
    return deletedAdmin;
};

export const adminService = {
    getAllLAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    softDelete,
};
