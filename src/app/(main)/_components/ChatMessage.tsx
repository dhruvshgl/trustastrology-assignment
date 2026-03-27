"use client";

import React from "react";

type Props = {
  role: "user" | "ai";
  text: string;
};

export default function ChatMessage({ role, text }: Props) {
  const isUser = role === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-lg shadow-sm leading-relaxed whitespace-pre-wrap break-words transition-opacity duration-200 ease-in-out bg-white dark:bg-gray-800 ${
          isUser ? "rounded-br-none bg-blue-600 text-white" : "rounded-bl-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
