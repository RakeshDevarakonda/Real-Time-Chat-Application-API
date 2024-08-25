import express from "express";
import { groupcollections } from "../schemas/GroupSchema.js";
import { CreateGroupController } from "../controllers/MessageControllers/creategroupcontroller.js";
import { SendGroupMessageController } from "../controllers/MessageControllers/sendgroupmessagecontroller.js";

const GroupRouter=express.Router()



GroupRouter.post("/groups",CreateGroupController)
GroupRouter.post("/groups/:groupId/messages",SendGroupMessageController)

export default GroupRouter