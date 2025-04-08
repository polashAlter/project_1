import { prisma } from "../app/services/prisma.service";
import { io } from "../app";
import { ChatService } from "../app/modules/chat/chat.service";


export const configureSocket = () => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("join_room", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room`);
        });

        socket.on("send_message", async (data) => {
            const { senderId, receiverId, message } = data;

            try {
      
         
                const savedMessage = await prisma.chatMessage.create({
                    data: { senderId, receiverId, message },
                });

                io.to(receiverId).emit("receive_message", savedMessage);

                const countUnread = await ChatService.unreadCount(
                    receiverId,
                    senderId
                );

                io.to(receiverId).emit("count_unread", countUnread);
            } catch (error) {
                console.error("Error handling message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};
