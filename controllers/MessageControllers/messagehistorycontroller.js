import mongoose from "mongoose";
import { messagecollections } from "../../schemas/MessageSchema.js";
import { usercollections } from "../../schemas/UsersSchema.js";
import { groupcollections } from "../../schemas/GroupSchema.js";
import { redisClient } from "../../redis-config.js";

// Helper to check if a user exists
async function userExists(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return false;
  const cacheKey = `user:id:${userId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return true;
  const user = await usercollections.findById(userId);
  if (user) {
    await redisClient.set(cacheKey, JSON.stringify(user), "EX", 3600);
    return true;
  }
  return false;
}

// Helper to check if a group exists
async function groupExists(groupId) {
  if (!mongoose.Types.ObjectId.isValid(groupId)) return false;
  const cacheKey = `group:id:${groupId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return true;
  const group = await groupcollections.findById(groupId);
  if (group) {
    await redisClient.set(cacheKey, JSON.stringify(group), "EX", 3600);
    return true;
  }
  return false;
}

export const GetMessageHistoryController = async (req, res, next) => {
  try {
    const { userId, withUserId, groupId, page , pageSize } = req.query;


    const pageNumber = parseInt(page);
    const pageSizeNumber = parseInt(pageSize);
    if (!userId) {
      return res.status(400).json({ message: "'userId' is required" });
    }
    if (!(await userExists(userId))) {
      return res.status(404).json({ message: "userId not found" });
    }
    if (withUserId && !(await userExists(withUserId))) {
      return res.status(404).json({ message: "withUserId not found" });
    }
    if (groupId && !(await groupExists(groupId))) {
      return res.status(404).json({ message: "groupId not found" });
    }
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ message: "Invalid 'page' number" });
    }
    if (isNaN(pageSizeNumber) || pageSizeNumber < 1) {
      return res.status(400).json({ message: "Invalid 'pageSize' number" });
    }
    let query = {};
    if (groupId) {
      query.groupId = groupId;
    } else if (withUserId) {
      query = {
        $or: [
          { senderId: userId, receiverId: withUserId },
          { senderId: withUserId, receiverId: userId },
        ],
      };
    } else {
      query = { $or: [{ senderId: userId }, { receiverId: userId }] };
    }
    const redisKey = JSON.stringify({ ...query, page: pageNumber, size: pageSizeNumber });
    const redisCache = await redisClient.get(redisKey);
    if (redisCache) {
      return res.status(200).json({ from: "redis", messages: JSON.parse(redisCache) });
    }
    const messages = await messagecollections
      .find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSizeNumber)
      .limit(pageSizeNumber)
      .exec();
    await redisClient.set(redisKey, JSON.stringify(messages), "EX", 3600);
    res.status(200).json({ messages });
  } catch (error) {
    next(error);
    console.error("Error retrieving message history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
