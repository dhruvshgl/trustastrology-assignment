import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import UserModel from "@/app/(backend)/_models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const { username, password } = RegisterSchema.parse(body);

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await UserModel.create({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: created._id },
      { status: 201 }
    );

  } catch (err) {
    console.error("/api/register error:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}