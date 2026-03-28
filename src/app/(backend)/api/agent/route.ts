import { NextResponse } from "next/server";
import { getOrchestratedAnswer } from "../../../agents/workflow";
import dbConnect from "@/utils/dbConnect";
import ConversationModel from "@/app/(backend)/_models/Conversation";
import ChatSessionModel from "@/app/(backend)/_models/ChatSession";

type RequestBody = {
  query: string;
  sessionId: string;
  userId?: string;
};

export async function POST(req: Request) {
  try {
    await dbConnect(); 

    const body = (await req.json()) as RequestBody;
    const { query, sessionId, userId } = body;



    const now = new Date();

    const deriveTitle = (text: string) => {
      if (!text) return "New Chat";
      const normalized = text.replace(/\s+/g, " ").trim();
      const firstLine = normalized.split("\n")[0] || normalized;
      return firstLine.length > 60 ? firstLine.slice(0, 57) + "..." : firstLine;
    };

    const titleForInsert = deriveTitle(query ?? "");

    try {

      const sessionUpsert: any = {
        $setOnInsert: {
          title: titleForInsert,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      } as any;

      if (userId) {
        sessionUpsert.$set.userId = userId;
      }

      const res = await ChatSessionModel.updateOne(
        { _id: sessionId },
        sessionUpsert,
        { upsert: true }
      );


      console.log(`/api/agent: ensured ChatSession _id=${sessionId} userId=${userId} result_n=${(res as any)?.n ?? 'unknown'}`);
      } catch (e) {


      console.warn("Could not ensure ChatSession exists:", e);
    }
    const messagePush: any = {
      $push: {
        messages: {
          role: "user",
          content: query,
          timestamp: now,
        },
      },
      $set: {
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    };

    if (userId) {

      messagePush.$setOnInsert.user_id = userId;
    }

    const convRes = await ConversationModel.updateOne({ sessionId }, messagePush, { upsert: true });


    console.log(`/api/agent: pushed user message sessionId=${sessionId} userId=${userId} conv_upsert_result=${JSON.stringify(convRes)}`);

    // If the ChatSession already existed with the default title, update it to a
    // short title derived from the user's first message so the Sidebar shows a
    // meaningful name.
    try {
      await ChatSessionModel.updateOne(
        { _id: sessionId, title: "New Chat" },
        { $set: { title: titleForInsert, updatedAt: new Date() } }
      );
    } catch (e) {
      console.warn("Could not set ChatSession title from first message:", e);
    }

    const answer = await getOrchestratedAnswer(query);

    await ConversationModel.updateOne(
      { sessionId },
      {
        $push: {
          messages: {
            role: "ai",
            content: answer,
            timestamp: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ answer }, { status: 200 });

  } catch (err) {
    console.error("/api/agent error:", err);
    return NextResponse.json(
      { error: "Internal Server Error by server" },
      { status: 500 }
    );
  }
}