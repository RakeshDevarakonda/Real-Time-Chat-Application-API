import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'usercollections', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'usercollections' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'groupcollections' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const messagecollections = mongoose.model("messagecollections", messageSchema);


