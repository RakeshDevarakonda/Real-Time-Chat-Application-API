import mongoose from "mongoose";
import { groupcollections } from "../../schemas/GroupSchema.js";
import { usercollections } from "../../schemas/UsersSchema.js";

export const CreateGroupController = async (req, res,next) => {
  try {
    const { name, members } = req.body;


    if (!name || !members) {
      return res.status(409).json({ message: "please enter all details name and members" });
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        message: "'name' is required and must be a non-empty string.",
      });
    }

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        message: "'members' is required and must be a non-empty array.",
      });
    }

    const nonEmptyMembers = members.filter(member => member.trim() !== "");


    if (nonEmptyMembers.length !== members.length) {
      return res.status(400).json({ message: "Member IDs cannot be empty strings." });
    }


    const memberSet = new Set(nonEmptyMembers);
    if (memberSet.size !== nonEmptyMembers.length) {
      return res.status(400).json({ message: "Duplicate member IDs are not allowed." });
    }

    const memberChecks = nonEmptyMembers.map(async (memberId) => {
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        return { memberId, valid: false };
      }

      const user = await usercollections.findById(memberId);
      return { memberId, valid: !!user };
    });


    const results = await Promise.all(memberChecks);

    const invalidMembers = results.filter(result => !result.valid).map(result => result.memberId);

    if (invalidMembers.length > 0) {
      return res.status(400).json({
        message: "Some member IDs are not registered users or Invalid Id",
        invalidMembers
      });
    }

    const newGroup = new groupcollections({
      name: name,
      members: nonEmptyMembers, 
      createdAt: new Date(),
    });

    const savedGroup = await newGroup.save();

    res.status(201).json({ group: savedGroup });

  } catch (error) {
    console.error("Error creating group:", error);
    next(error)
    res.status(500).json({ message: "Internal server error" });
  }
};
