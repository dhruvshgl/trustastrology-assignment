import ConversationModel from "@/../src/app/(backend)/_models/Conversation";
export async function saveMessage({
  sessionId,
  role,
  content,
  timestamp,
}: {
  sessionId: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}) {
  await ConversationModel.updateOne(
    { sessionId },
    {
      $push: {
        messages: { role, content, timestamp },
      },
    },
    { upsert: true }
  );
}