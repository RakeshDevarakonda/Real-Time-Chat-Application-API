import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "usercollections" }],
});

export const groupcollections = mongoose.model("groupcollections", GroupSchema);
