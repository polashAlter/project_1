import {
    Admin,
    Doctor,
    Patient,
    User,
    UserRole,
    UserStatus,
} from "@prisma/client";

import AppError from "../../errors/AppError";
import {
    existsById,
    findUserByEmail,
    findUserById,
    prisma,
} from "../../services/prisma.service";
import { processPassword } from "../../utls/passwordHash";
import getAllItems from "../../utls/getAllItems";
import { TQueryObject } from "../../types/common";

const createUser = async (
    payload: User & (Admin | Doctor | Patient) & { specialties?: string[] },
    role: UserRole,
    modelName: "admin" | "doctor" | "patient"
) => {
    const user = await findUserByEmail(payload.email);
    if (user) throw new AppError(400, "User already exists");

    const hashedPassword = await processPassword.hashPassword(
        payload.password as string
    );

    const result = await prisma.$transaction(async (transactionClient: any) => {
        const newUser = await transactionClient.user.create({
            data: {
                email: payload.email,
                password: hashedPassword,
                role: role,
            },
        });

        const { password, specialties, ...userData } = payload;

        const newEntity = await transactionClient[modelName].create({
            data: userData,
        });

        if (role === UserRole.DOCTOR && payload.specialties) {
            const specialtyPromises = payload.specialties.map(
                async (specialtyId) => {
                    await existsById(
                        prisma.specialty,
                        specialtyId,
                        "Specialty",
                        false
                    );
                }
            );

            await Promise.all(specialtyPromises);

            await transactionClient.doctorSpecialty.createMany({
                data: payload.specialties.map((specialtyId) => ({
                    specialtyId,
                    doctorId: newEntity.id,
                })),
            });
        }

        return { [modelName]: newEntity };
    });

    return result;
};

const createAdmin = async (payload: User & Admin) => {
    return createUser(payload, UserRole.ADMIN, "admin");
};
const createDoctor = async (payload: User & Doctor) => {
    return createUser(payload, UserRole.DOCTOR, "doctor");
};

const createPatient = async (payload: User & Patient) => {
    payload.needPasswordChange = false;
    return createUser(payload, UserRole.PATIENT, "patient");
};

const getAllUsers = async (query: TQueryObject) => {
    const result = await getAllItems(prisma.user, query, {
        searchableFields: ["email"],
        filterableFields: ["email", "role", "status"],
        andConditions: [{ status: { not: UserStatus.DELETED } }],
        isDeletedCondition: false,
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            admin: true,
            doctor: true,
            patient: true,
        },
    });

    return result;
};

const getMyProfile = async (userData: User) => {
    const user = await prisma.user.findUnique({
        where: { id: userData?.id },
        include: {
            admin:
                userData?.role === UserRole.ADMIN ||
                userData?.role === UserRole.SUPER_ADMIN,
            doctor: userData?.role === UserRole.DOCTOR && {
                include: {
                    specialties: {
                        select: {
                            specialty: true,
                        },
                    },
                },
            },
            patient: userData?.role === UserRole.PATIENT,
        },
    });

    if (!user) throw new AppError(404, "User profile not found");

    const myProfile = {
        ...(user.admin && { ...user.admin, adminId: user.admin.id }),
        ...(user.doctor && {
            ...user.doctor,
            doctorId: user.doctor.id,
            specialties: (user.doctor as any).specialties?.map(
                (s: any) => s.specialty
            ),
        }),
        ...(user.patient && { ...user.patient, patientId: user.patient.id }),
        id: user.id,
        role: user.role,
        needPasswordChange: user.needPasswordChange,
        status: user.status,
    };

    return myProfile;
};

const changeUserStatus = async (userId: string, status: UserStatus) => {
    await findUserById(userId);

    const updateUser = await prisma.user.update({
        where: { id: userId },
        data: { status },
    });

    return updateUser;
};

export const userService = {
    createAdmin,
    createDoctor,
    createPatient,
    getAllUsers,
    getMyProfile,
    changeUserStatus,
};
