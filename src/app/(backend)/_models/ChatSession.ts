import { z } from "zod";

export const ChatSessionSchema = z.object({
  _id: z.string(),
  userId: z.string(), // reference to User
  title: z.string().default("New Chat"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;

import mongoose from "mongoose";

const ChatSessionMongooseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, default: "New Chat" },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

const ChatSessionModel =
  mongoose.models.ChatSession ||
  mongoose.model("ChatSession", ChatSessionMongooseSchema);

export default ChatSessionModel;