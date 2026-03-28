import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import ConversationModel from "@/app/(backend)/_models/Conversation";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  const conversation = await ConversationModel.findOne({ sessionId });


  console.log(`/api/messages: sessionId=${sessionId} -> conversation ${conversation ? 'FOUND' : 'MISSING'}`);

  return NextResponse.json({
    messages: conversation?.messages || [],
  });
}