import { NextResponse } from "next/server";
import { getOrchestratedAnswer } from "../../../agents/workflow";

type RequestBody = {
  query: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const query = body.query;

    const answer = await getOrchestratedAnswer(query);
    return NextResponse.json({ answer }, { status: 200 });
  } catch (err) {
    console.error("/api/agent error:", err);
    return NextResponse.json({ error: "Internal Server Error by server" }, { status: 500 });
  }
}