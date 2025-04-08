import catchAsync from "../../utls/catchAsync";
import sendSuccessResponse from "../../utls/sendSuccessResponse";
import { ChatService } from "./chat.service";

const getChatHistory = catchAsync(async (req, res) => {
    const { senderId, receiverId } = req.params;
    const chatHistory = await ChatService.getCahtHistory(senderId, receiverId);
    sendSuccessResponse(res, chatHistory, "Chat history fetched successfully");
});

const updateMessage = catchAsync(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await ChatService.updateChatMessage(Number(id), payload);
    
    sendSuccessResponse(res, result, "Message updated successfully");
});

const countUnread = catchAsync(async (req, res) => {
    const { userId, senderId } = req.query;

    const unreadCount = await ChatService.unreadCount(
        userId as string,
        senderId as string
    );
    sendSuccessResponse(res, unreadCount, "Unread count fetched successfully");
});

const uploadFileMsg = catchAsync(async (req) => {
    const data = req.body.data;
    const file = req.file;
    await ChatService.uploadFileMsg(data, file);
});

export const ChatController = {
    getChatHistory,
    updateMessage,
    countUnread,
    uploadFileMsg,
};
