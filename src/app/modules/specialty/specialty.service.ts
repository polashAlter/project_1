import { Specialty } from "@prisma/client";
import { prisma } from "../../services/prisma.service";
import AppError from "../../errors/AppError";
import getAllItems from "../../utls/getAllItems";
import { TQueryObject } from "../../types/common";
import { sendImageToCloudinary } from "../../services/sendImageToCloudinary";
import sharp from "sharp";

const createSpecialty = async (specialtyData: Specialty, file: any) => {
    const specialty = await prisma.specialty.findFirst({
        where: { title: { equals: specialtyData.title, mode: "insensitive" } },
    });

    if (specialty) {
        throw new AppError(400, `${specialtyData.title} already exists`);
    }

    let imgUrl: string | null = null;

    if (file) {
        const fileName = file?.originalname;

        const optimizedBuffer = await sharp(file.buffer)
            .resize({ width: 320 })
            .webp({ quality: 80 })
            .toBuffer();

        const uploadedImage = await sendImageToCloudinary(
            `${fileName || `specialty`}_${specialtyData.title}`,
            optimizedBuffer
        );

        imgUrl = uploadedImage?.secure_url;
        console.log(imgUrl, "imageUrl........");
    }

    specialtyData.icon = imgUrl;

    return await prisma.specialty.create({
        data: specialtyData,
    });
};

const getAllSpecialties = async (query: TQueryObject) => {
    const result = await getAllItems<Specialty>(prisma.specialty, query, {
        // orderBy: { title: "asc" },
        searchableFields: ["title"],
        filterableFields: ["title"],
        isDeletedCondition: false,
    });

    return result;
};

const deleteSpecialty = async (id: string) => {
    return await prisma.specialty.delete({
        where: { id },
    });
};

export const SpecialtyServices = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
};
