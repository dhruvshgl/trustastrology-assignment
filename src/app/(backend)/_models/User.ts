import { z } from "zod";
import mongoose from "mongoose";

export const UserSchema = z.object({
  _id: z.string(), // Mongo ObjectId (string form)
  username: z.string().min(3),
  password: z.string().min(6),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

const UserMongooseSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

const UserModel =
  mongoose.models.User ||
  mongoose.model("User", UserMongooseSchema);

export default UserModel;