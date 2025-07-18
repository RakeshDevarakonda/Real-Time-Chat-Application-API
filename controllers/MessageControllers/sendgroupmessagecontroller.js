import mongoose from "mongoose";
import { messagecollections } from "../../schemas/MessageSchema.js";
import { groupcollections } from "../../schemas/GroupSchema.js";
import { usercollections } from "../../schemas/UsersSchema.js";
import { redisClient } from "../../redis-config.js";

// Helper to get user from cache or DB
async function getUserByIdWithCache(userId) {
  const cacheKey = `user:id:${userId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);
  const user = await usercollections.findById(userId);
  if (user) {
    await redisClient.set(cacheKey, JSON.stringify(user), "EX", 3600);
  }
  return user;
}

// Helper to get group from cache or DB
async function getGroupByIdWithCache(groupId) {
  const cacheKey = `group:id:${groupId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);
  const group = await groupcollections.findById(groupId);
  if (group) {
    await redisClient.set(cacheKey, JSON.stringify(group), "EX", 3600);
  }
  return group;
}

export const SendGroupMessageController = async (req, res, next) => {
  try {
    const { senderId, content, groupId } = req.body;

    if (!senderId || !content || !groupId) {
      return res.status(400).json({ message: "senderId, groupId, and content are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "Invalid sender ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID format" });
    }
    if (typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "'content' is required and must be a non-empty string." });
    }
    const sender = await getUserByIdWithCache(senderId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found." });
    }
    const group = await getGroupByIdWithCache(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }
    if (!group.members.includes(senderId)) {
      return res.status(403).json({ message: "Sender is not a member of the group" });
    }
    const newMessage = new messagecollections({ senderId, groupId, content, createdAt: new Date() });
    const savedMessage = await newMessage.save();
    await redisClient.del(JSON.stringify({ groupId, page: 1, size: 10 }));
    res.status(201).json({ message: savedMessage });
  } catch (error) {
    console.error("Error sending group message:", error);
    next(error);
  }
};
