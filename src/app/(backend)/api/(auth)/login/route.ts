import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import UserModel from "@/app/(backend)/_models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { username, password } = body;

    
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }


    const user = await UserModel.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Login successful", userId: user._id },
      { status: 200 }
    );

  } catch (err) {
    console.error("/api/login error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}