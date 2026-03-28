import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import ChatSessionModel from "@/app/(backend)/_models/ChatSession";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const sessions = await ChatSessionModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();


    console.log(`/api/sessions: userId=${userId} -> found ${sessions?.length ?? 0} sessions`);

    return NextResponse.json({ sessions });
  } catch (err) {

    console.error("GET /api/sessions error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}