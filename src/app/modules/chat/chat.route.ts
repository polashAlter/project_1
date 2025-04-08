import { Router } from "express";
import { ChatController } from "./chat.controller";
import { handleImageUpload } from "../../middleWares/handleImageUpload";

const router = Router();

router.get("/:senderId/:receiverId", ChatController.getChatHistory);

router.patch("/:id", ChatController.updateMessage);

router.get("/countUnread", ChatController.countUnread);

router.post("/upload", handleImageUpload, ChatController.uploadFileMsg);

export const ChatRouter = router;
