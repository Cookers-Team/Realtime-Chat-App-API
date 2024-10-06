import mongoose from "mongoose";
import { schemaOptions } from "../configurations/schemaConfig.js";

const ConversationMemberSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastReadMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    canMessage: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    canUpdate: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    canAddMember: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
  },
  schemaOptions
);

const ConversationMember = mongoose.model(
  "ConversationMember",
  ConversationMemberSchema
);
export default ConversationMember;
