import mongoose from "mongoose";
import { groupcollections } from "../../schemas/GroupSchema.js";
import { usercollections } from "../../schemas/UsersSchema.js";
import { messagecollections } from "../../schemas/MessageSchema.js";
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

export const SendMessageController = async (req, res, next) => {
  const { senderId, receiverId, groupId, content } = req.body;

  try {
    if (!senderId || !content || content.trim().length === 0) {
      return res.status(400).json({ message: "Sender ID and content are required" });
    }
    if (!receiverId && !groupId) {
      return res.status(400).json({ message: "Provide at least receiverId or groupId" });
    }
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "Invalid sender ID format" });
    }
    if (receiverId && !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID format" });
    }
    if (groupId && !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID format" });
    }
    if (receiverId && senderId === receiverId) {
      return res.status(400).json({ message: "Sender ID and receiver ID cannot be the same" });
    }
    if (groupId && senderId === groupId) {
      return res.status(400).json({ message: "Sender ID and group ID cannot be the same" });
    }

 
    const sender = await getUserByIdWithCache(senderId);
    if (!sender) {
      return res.status(404).json({ message: "Invalid Sender ID" });
    }

    let receiver = null;
    if (receiverId) {
      receiver = await getUserByIdWithCache(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Invalid Receiver ID" });
      }
    }

    let group = null;
    if (groupId) {
      group = await getGroupByIdWithCache(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      if (!group.members.includes(senderId)) {
        return res.status(403).json({ message: "Sender is not a member of the group" });
      }
    }

    // Save message(s)
    let message;
    if (receiverId && groupId) {
      // Send to both receiver and group
      message = new messagecollections({ senderId, receiverId, groupId, content });
      await message.save();
      // Invalidate both caches
      await redisClient.del(JSON.stringify({ $or: [{ senderId }, { receiverId }], page: 1, size: 10 }));
      await redisClient.del(JSON.stringify({ groupId, page: 1, size: 10 }));
    } else if (receiverId) {
      // Private message
      message = new messagecollections({ senderId, receiverId, content });
      await message.save();
      await redisClient.del(JSON.stringify({ $or: [{ senderId }, { receiverId }], page: 1, size: 10 }));
    } else if (groupId) {
      // Group message
      message = new messagecollections({ senderId, groupId, content });
      await message.save();
      await redisClient.del(JSON.stringify({ groupId, page: 1, size: 10 }));
    }

    res.status(201).json({ success: true, message: "Message sent successfully", content });
  } catch (error) {
    console.error("SendMessageController error:", error);
    next(error);
  }
};
