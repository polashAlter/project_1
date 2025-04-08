import { prisma } from "../../services/prisma.service";
import { io } from "../../../app";
import { sendImageToCloudinary } from "../../services/sendImageToCloudinary";
import AppError from "../../errors/AppError";
import sharp from "sharp";

const getCahtHistory = async (senderId: string, receiverId: string) => {
    const chatHistory = await prisma.chatMessage.findMany({
        where: {
            OR: [
                {
                    senderId,
                    receiverId,
                },
                {
                    senderId: receiverId,
                    receiverId: senderId,
                },
            ],
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    return chatHistory;
};

const updateChatMessage = async (id: number, payload: { read: true }) => {
    const result = await prisma.$transaction(async (tx: any) => {
        const updatedMessage = await tx.chatMessage.update({
            where: {
                id,
            },
            data: payload,
        });

        const unreadCount = await tx.chatMessage.count({
            where: {
                senderId: updatedMessage.senderId,
                receiverId: updatedMessage.receiverId,
                read: false,
            },
        });

        // io.to(updatedMessage.receiverId).emit("count_unread", unreadCount);  // not working on vercel have to debug

        return { updatedMessage, unreadCount };
    });

    return result;
};

const unreadCount = async (userId: string, senderId: string) => {
    const unreadCount = await prisma.chatMessage.count({
        where: {
            senderId,
            receiverId: userId,
            read: false,
        },
    });

    return unreadCount;
};

const uploadFileMsg = async (data: any, file: any) => {
    let imgUrl: string | undefined = undefined;

    if (file) {
        const fileName = file?.originalname;

        const optimizedBuffer = await sharp(file.buffer)
            .resize({ width: 480 })
            .webp({ quality: 80 })
            .toBuffer();

        const uploadedImage = await sendImageToCloudinary(
            `${fileName || `chat_file`}_${data.senderId}-${data.receiverId}`,
            optimizedBuffer
        );

        imgUrl = uploadedImage?.secure_url;
    }

    // imgUrl =
    //     "https://res.cloudinary.com/dht3ucvz9/image/upload/v1739656495/N_HealthCare/bijoy_tower.jpg_fa226a00-e59d-4bfc-8db1-ec1c905906f1-786561b6-09f2-47ce-8f24-88247a49b783.jpg";

    if (!imgUrl) throw new AppError(400, "File upload failed");

    const savedMessage = await prisma.chatMessage.create({
        data: {
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: imgUrl,
            type: "image",
        },
    });

    io.to(data.receiverId).emit("receive_message", savedMessage);
    io.to(data.senderId).emit("receive_message", savedMessage);

    const countUnread = await ChatService.unreadCount(
        savedMessage.receiverId,
        savedMessage.senderId
    );
    io.to(savedMessage.receiverId).emit("count_unread", countUnread);
};

export const ChatService = {
    getCahtHistory,
    updateChatMessage,
    unreadCount,
    uploadFileMsg,
};
