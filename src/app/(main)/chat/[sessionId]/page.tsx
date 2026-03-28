"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ChatMessage from "@/app/(main)/_components/ChatMessage";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const routeSessionId = params.sessionId as string | undefined;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!routeSessionId) return;
      try {
        const res = await fetch(`/api/messages?sessionId=${encodeURIComponent(routeSessionId)}`);
        if (!res.ok) return;
        const data = await res.json();
        const serverMsgs = Array.isArray(data.messages) ? data.messages : [];

        const mapped: Message[] = serverMsgs.map((m: any, i: number) => ({
          id: `${m.timestamp ?? i}-${i}`,
          role: m.role,
          text: m.content,
        }));

        setMessages(mapped);
      } catch (e) {

        console.warn("Could not load conversation messages", e);
      }
    };

    loadMessages();
  }, [routeSessionId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);




  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !routeSessionId) return;

    const userMsg: Message = {
      id: String(Date.now()) + "-u",
      role: "user",
      text: trimmed,
    };

    setMessages((s) => [...s, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          sessionId: routeSessionId,
          userId,
        }),
      });

      const data = await res.json();
      const aiText = data?.answer ?? data?.error ?? "(No response)";

      const aiMsg: Message = {
        id: String(Date.now()) + "-a",
        role: "ai",
        text: aiText,
      };

      setMessages((s) => [...s, aiMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: String(Date.now()) + "-a",
        role: "ai",
        text: "Error: Could not reach server.",
      };
      setMessages((s) => [...s, errMsg]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-start justify-center py-2 px-3">
      <div className="w-full max-w-3xl flex flex-col h-[80vh] md:h-[85vh] shadow-lg rounded-lg overflow-hidden">
        
        {}
        <header className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-700">
          <h1 className="text-lg font-semibold">AI Assistant</h1>
          <p className="text-sm text-gray-500">Ask anything</p>
        </header>

        {}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-12">
              Start the conversation by typing a message below.
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className="opacity-0 animate-fade-in">
              <ChatMessage role={m.role} text={m.text} />
            </div>
          ))}
        </div>

        {}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-4 py-3">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                loading
                  ? "Waiting for response..."
                  : "Write a message..."
              }
              disabled={loading}
              rows={1}
              className="flex-1 resize-none rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={send}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 220ms ease forwards;
        }
      `}</style>
    </div>
  );
}