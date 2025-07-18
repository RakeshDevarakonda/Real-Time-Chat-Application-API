import mongoose from "mongoose";
import { groupcollections } from "../../schemas/GroupSchema.js";
import { usercollections } from "../../schemas/UsersSchema.js";
import { redisClient } from "../../redis-config.js";

// Helper to get user from cache or DB
async function getUserByIdWithCache(userId) {
  const cacheKey = `user:id:${userId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  if (!mongoose.Types.ObjectId.isValid(userId)) return false;
  
  const user = await usercollections.findById(userId);

  if (user) {
    await redisClient.set(cacheKey, JSON.stringify(user), "EX", 3600);
  }


  return user;
}

export const CreateGroupController = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "'name' is required and must be a non-empty string." });
    }
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "'members' is required and must be a non-empty array." });
    }
    const nonEmptyMembers = members.filter((member) => member.trim() !== "");
    if (nonEmptyMembers.length !== members.length) {
      return res.status(400).json({ message: "Member IDs cannot be empty strings." });
    }
    const memberSet = new Set(nonEmptyMembers);
    if (memberSet.size !== nonEmptyMembers.length) {
      return res.status(400).json({ message: "Duplicate member IDs are not allowed." });
    }
    // Validate all members
    const memberChecks = await Promise.all(nonEmptyMembers.map(getUserByIdWithCache));
    const invalidMembers = nonEmptyMembers.filter((_, i) => !memberChecks[i]);
    if (invalidMembers.length > 0) {
      return res.status(400).json({ message: "Some member IDs are not registered users or invalid.", invalidMembers });
    }
    const newGroup = new groupcollections({ name: name.trim(), members: nonEmptyMembers, createdAt: new Date() });
    const savedGroup = await newGroup.save();
    await redisClient.set(`group:id:${savedGroup._id}`, JSON.stringify(savedGroup), "EX", 3600);
    res.status(201).json({ group: savedGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    next(error);
  }
};
