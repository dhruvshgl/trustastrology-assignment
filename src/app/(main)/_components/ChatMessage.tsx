"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type Props = {
  role: "user" | "ai";
  text: string;
};

export default function ChatMessage({ role, text }: Props) {
  const isUser = role === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-lg shadow-sm leading-relaxed transition-opacity duration-200 ease-in-out ${
          isUser
            ? "rounded-br-none bg-blue-600 text-white"
            : "rounded-bl-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        }`}
      >
        {(() => {

          const mdComponents: any = {
            pre: (props: any) => {
              const { children } = props;
              return (
                <pre className="overflow-x-auto rounded bg-gray-900 text-white p-3 my-2">
                  {children}
                </pre>
              );
            },
            code: (props: any) => {
              const { className, children, ...rest } = props;
              const isBlockCode = typeof className === "string" && className.includes("language-");

              if (isBlockCode) {
                return (
                  <code className={className} {...rest}>
                    {String(children).replace(/\n$/, "")}
                  </code>
                );
              }

              return (
                <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded" {...rest}>
                  {children}
                </code>
              );
            },
            p: (props: any) => {
              return <p className="my-1">{props.children}</p>;
            },
          };

          return (

            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} components={mdComponents}>
              {text}
            </ReactMarkdown>
          );
        })()}
      </div>
    </div>
  );
}
