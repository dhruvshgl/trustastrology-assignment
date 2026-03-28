import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import ChatSessionModel from "@/app/(backend)/_models/ChatSession";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }



    const recentThresholdMs = 3000;
    const recent = await ChatSessionModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
    if (recent) {
      const age = Date.now() - new Date(recent.createdAt).getTime();
      if (age <= recentThresholdMs) {
        return NextResponse.json({ sessionId: recent._id });
      }
    }

    const session = await ChatSessionModel.create({
      userId,
      title: "New Chat",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ sessionId: session._id });
  } catch (err) {

    console.error("POST /api/create-sessions error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}