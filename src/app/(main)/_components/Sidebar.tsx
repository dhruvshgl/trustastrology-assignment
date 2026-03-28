"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  _id: string;
  title: string;
};

export default function Sidebar() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {

          setSessions([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/sessions?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load sessions: ${res.status} ${text}`);
        }

        const data = await res.json();
        setSessions(data.sessions || []);
      } catch (e: any) {

        console.error("Failed to fetch sessions", e);
        setError(e?.message ?? "Could not load sessions");
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined") {
        bc = new BroadcastChannel("chat-sessions");
        bc.onmessage = (ev) => {
          try {
            const msg = ev.data;
            if (msg?.type === "session-updated") {
              const { sessionId, title } = msg as any;
              setSessions((prev) => {
                const idx = prev.findIndex((s) => s._id === sessionId);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = { ...copy[idx], title };
                  return copy;
                }
                return [{ _id: sessionId, title }, ...prev];
              });
            }
          } catch (e) {
            console.warn("Sidebar broadcast handler error", e);
          }
        };
      }
    } catch (e) {
      console.warn("Could not initialize BroadcastChannel in Sidebar", e);
    }

    return () => {
      try {
        bc?.close();
      } catch (e) {}
    };
  }, []);

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-4">Chats</h2>

      <div className="mb-4">
        <button
          onClick={async () => {

            let userId = localStorage.getItem("userId");
            if (!userId) {
              userId = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
              localStorage.setItem("userId", userId);
            }

            try {


              const res = await fetch("/api/create-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              });

              if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to create session: ${res.status} ${text}`);
              }

              const data = await res.json();
              const sessionId = data.sessionId;
              if (!sessionId) throw new Error("No sessionId returned from server");

              setSessions((s) => [{ _id: sessionId, title: "New Chat" }, ...s]);

              router.push(`/chat/${sessionId}`);
            } catch (e: any) {

              console.error("Create session failed", e);
              setError(e?.message ?? "Could not create session");
            }
          }}
          className="mb-4 bg-white text-black py-2 rounded w-full text-left"
        >
          + New Chat
        </button>
        {}
      </div>

      {}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 p-2 flex gap-2 items-center justify-between">
        <button
          onClick={async () => {

            let userId = localStorage.getItem("userId");
            if (!userId) {
              userId = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
              localStorage.setItem("userId", userId);
            }

            try {
              const res = await fetch("/api/create-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              });

              if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to create session: ${res.status} ${text}`);
              }

              const data = await res.json();
              const sessionId = data.sessionId;
              if (!sessionId) throw new Error("No sessionId returned from server");

              router.push(`/chat/${sessionId}`);
            } catch (e: any) {

              console.error("Create session failed", e);
              setError(e?.message ?? "Could not create session");
            }
          }}
          className="flex-1 bg-white text-black py-2 rounded text-center"
        >
          + New Chat
        </button>

        {}
        <button
          onClick={() => {
            try {
              localStorage.removeItem("userId");
              localStorage.removeItem("token");
            } catch (e) {}
            router.push("/auth/login");
          }}
          className="bg-red-600 text-white px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && <div className="text-sm text-gray-400">Loading...</div>}
        {!loading && error && <div className="text-sm text-red-400">{error}</div>}
        {!loading && sessions.length === 0 && !error && (
          <div className="text-sm text-gray-400">No chats yet. Start a new chat.</div>
        )}

        {sessions.map((session) => (
          <div
            key={session._id}
            onClick={() => router.push(`/chat/${session._id}`)}
            className="p-2 rounded hover:bg-gray-700 cursor-pointer"
          >
            {session.title}
          </div>
        ))}
      </div>
    </div>
  );
}