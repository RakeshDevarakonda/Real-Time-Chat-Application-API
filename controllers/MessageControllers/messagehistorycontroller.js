import mongoose from "mongoose";
import { messagecollections } from "../../schemas/MessageSchema.js";
import { usercollections } from "../../schemas/UsersSchema.js";
import { groupcollections } from "../../schemas/GroupSchema.js";

export const GetMessageHistoryController = async (req, res, next) => {
  try {
    const { userId, withUserId, groupId, page, pageSize } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "'userId' is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid 'userId' format" });
    }
    if (userId) {
      const sender = await usercollections.findById(userId);
      if (!sender) {
        return res.status(404).json({ message: "  userId not found" });
      }
    }

    let query = {};

    query = { $or: [{ senderId: userId }, { receiverId: userId }] };

    if (withUserId) {
      if (!mongoose.Types.ObjectId.isValid(withUserId)) {
        return res.status(400).json({ message: "Invalid WithUserID" });
      }

      const withuseridchecker = await usercollections.findById(withUserId);
      if (!withuseridchecker) {
        return res.status(404).json({ message: " Withuser ID is not found" });
      }

      query = {
        $or: [
          { senderId: userId, receiverId: withUserId },
          { senderId: withUserId, receiverId: userId },
        ],
      };
    }

    if (groupId) {
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ message: "Invalid 'groupid' format" });
      }

      
      const checkgroupexist = await groupcollections.findById(groupId);
      if (!checkgroupexist) {
        return res.status(404).json({ message: " group ID is not found" });
      }

      query.groupId = groupId;
      query.$or = [{ senderId: userId }, { receiverId: userId }];
    }

    if (page) {
      var pageNumber = parseInt(page);
      if (isNaN(pageNumber) || pageNumber < 1) {
        return res.status(400).json({ message: "Invalid 'page' number" });
      }
    }

    if (pageSize) {
      var pageSizeNumber = parseInt(pageSize);

      if (isNaN(pageSizeNumber) || pageSizeNumber < 1) {
        return res.status(400).json({ message: "Invalid 'pageSize' number" });
      }
    }

    // if (pageNumber==0){
    //   return res.status(400).json({ message: "page cannot be zero" });

    // }

    // if (pageSizeNumber==0){
    //   return res.status(400).json({ message: "pagesize cannot be zero" });

    // }

    console.log(query);

    const messages = await messagecollections
      .find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSizeNumber)
      .limit(pageSizeNumber)
      .exec();

    // Respond with the messages
    res.status(200).json({ messages });
  } catch (error) {
    next(error);
    console.error("Error retrieving message history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
