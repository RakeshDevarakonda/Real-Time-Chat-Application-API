import mongoose from "mongoose";
import { groupcollections } from "../../schemas/GroupSchema.js";
import { usercollections } from "../../schemas/UsersSchema.js";
import { messagecollections } from "../../schemas/MessageSchema.js";

export const SendMessageController = async (req, res, next) => {
  const { senderId, receiverId, groupId, content } = req.body;

  try {
    if (!senderId) {
      return res.status(400).json({ message: "Sender ID is required" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    if (senderId && !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "Invalid sender ID format" });
    }

    if (!receiverId) {
      return res.status(400).json({ message: "receiverid is required" });
    }

    if (receiverId && !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid Receiver ID format" });
    }

 

    const sender = await usercollections.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: " Invalid Sender ID" });
    }

    if (receiverId) {
      const receiver = await usercollections.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Invalid Receiver ID" });
      }
    }
    

      if (groupId && !mongoose.Types.ObjectId.isValid(groupId) ) {
        return res.status(400).json({ message: "Invalid group ID format" });
      }

      if (groupId &&  groupId.trim().length !==0){

        const group = await groupcollections.findById(groupId);
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }
  
        if (!group.members.includes(senderId)) {
          return res
            .status(403)
            .json({ message: "Sender is not a member of the group" });
        
      }
      }



    const message = new messagecollections({
      senderId,
      receiverId,
      groupId ,
      content,
    });
    await message.save();

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully", content });
  } catch (error) {
    console.error("SendMessageController error:", error);
    next(error);
  }
};
