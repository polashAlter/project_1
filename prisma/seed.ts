import { processPassword } from "./../src/app/utls/passwordHash";
import { PrismaClient, UserRole } from "@prisma/client";

export const seedSuperAdmin = async () => {
    const prisma = new PrismaClient();
    try {
        console.log("Seeding super admin");
        const superAdminExists = await prisma.user.findFirst({
            where: {
                role: UserRole.SUPER_ADMIN,
            },
        });

        if (!superAdminExists) {
            const password = await processPassword.hashPassword(
                process.env.SUPER_ADMIN_PASSWORD as string
            );
            const result = await prisma.user.create({
                data: {
                    email: process.env.SUPER_ADMIN_EMAIL as string,
                    password,
                    role: UserRole.SUPER_ADMIN,
                    needPasswordChange: false,

                    admin: {
                        create: {
                            name: process.env.SUPER_ADMIN_NAME as string,
                        },
                    },
                },
            });
            console.log("Super admin seeded successfully", result);
        }
    } catch (err) {
        console.error(err, "Error while seeding super admin");
    } finally {
        await prisma.$disconnect();
    }
};

seedSuperAdmin();
