import { z } from "zod";
import mongoose from "mongoose";

export const MessageSchema = z.object({
  role: z.enum(["user", "ai"]),
  content: z.string(),
  timestamp: z.date(),
});

export const ConversationSchema = z.object({
  _id: z.string(),
  sessionId: z.string(),
  messages: z.array(MessageSchema),
  user_id: z.string().optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

const MessageMongooseSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "ai"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

const ConversationMongooseSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  messages: [MessageMongooseSchema],
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationMongooseSchema);

export default ConversationModel;