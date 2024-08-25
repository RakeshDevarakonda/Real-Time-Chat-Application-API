import mongoose from "mongoose";
import { messagecollections } from "../../schemas/MessageSchema.js";
import { groupcollections } from "../../schemas/GroupSchema.js";
import { usercollections } from "../../schemas/UsersSchema.js";

export const SendGroupMessageController = async (req, res) => {
  try {
    const { senderId, content } = req.body;

    const { groupId } = req.params;

    if (!senderId) {
      return res.status(400).json({ message: "'senderId' is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({
        message: "'Invalid Sender ID",
      });
    }

    const checkSendIdExist = await usercollections.findById(senderId);

    if (!checkSendIdExist || checkSendIdExist.length == 0) {
      return res.status(400).json({ message: "'senderId' is not valid" });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        message: "'content' is required and must be a non-empty string.",
      });
    }

    if (!groupId ) {
      return res.status(400).json({
        message: "'groupId' is required ",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        message: "'Invalid Group ID",
      });
    }

    const sender = await usercollections.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found." });
    }

    const group = await groupcollections.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const newMessage = new messagecollections({
      senderId: senderId,
      groupId: groupId,
      
      content: content,
      createdAt: new Date(),
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({ message: savedMessage });
  } catch (error) {
    console.error("Error sending group message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
