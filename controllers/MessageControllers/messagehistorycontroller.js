import mongoose from "mongoose";
import { messagecollections } from "../../schemas/MessageSchema.js";



export const GetMessageHistoryController = async (req, res) => {
  try {
    const { userId, withUserId, groupId, page, pageSize } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "'userId' is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid 'userId' format" });
    }

    let query = {};

    query = { $or: [{ senderId: userId }, { receiverId: userId }] };

    if (withUserId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid 'receiverid' format" });
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
    console.error("Error retrieving message history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
