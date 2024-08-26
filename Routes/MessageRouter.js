import express from "express";
import { SendMessageController } from "../controllers/MessageControllers/SendMessageControllers.js";
import { GetMessageHistoryController } from "../controllers/MessageControllers/messagehistorycontroller.js";

const MessageRouter=express.Router()


MessageRouter.post("/messages",SendMessageController)
MessageRouter.get("/messages/history",GetMessageHistoryController)


export default MessageRouter