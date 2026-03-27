"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatMessage from "../_components/ChatMessage";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom whenever messages change
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: String(Date.now()) + "-u", role: "user", text: trimmed };
    setMessages((s) => [...s, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await res.json();
      const aiText = data?.answer ?? data?.error ?? "(No response)";
      const aiMsg: Message = { id: String(Date.now()) + "-a", role: "ai", text: aiText };
      // Fade-in effect achieved by appending
      setMessages((s) => [...s, aiMsg]);
    } catch (err) {
      const errMsg: Message = { id: String(Date.now()) + "-a", role: "ai", text: "Error: Could not reach server." };
      setMessages((s) => [...s, errMsg]);
    } finally {
      setLoading(false);
      // focus textarea again
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-3xl bg-transparent flex flex-col h-[80vh] md:h-[85vh] shadow-lg rounded-lg overflow-hidden">
        <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-700">
          <h1 className="text-lg font-semibold">AI Assistant</h1>
          <p className="text-sm text-gray-500">Ask anything </p>
        </header>

        <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-12">Start the conversation by typing a message below.</div>
          )}

          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="opacity-0 animate-fade-in">
                <ChatMessage role={m.role} text={m.text} />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={loading ? "Waiting for response..." : "Write a message... (Enter to send, Shift+Enter for newline)"}
              disabled={loading}
              rows={1}
              className="flex-1 resize-none rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={send}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 2L11 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 220ms ease forwards; }
      `}</style>
    </div>
  );
}
