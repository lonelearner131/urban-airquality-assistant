"use client";

import React, { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ChatMessage } from "@/schemas/chat";

export interface ChatPanelProps {
  readonly locationName: string;
  readonly aqi: number;
  readonly riskTier: string;
  readonly summary: string;
  readonly language?: "en" | "hi";
}

const QUICK_PROMPTS = [
  "Is it safe for children to play outdoors today?",
  "Which mask provides effective PM2.5 protection?",
  "How should I operate my air purifier at night?",
];

interface ChatHeaderProps {
  readonly language: "en" | "hi";
}

function ChatHeader({ language }: ChatHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
      <div className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
        <MessageSquare className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {language === "hi" ? "स्मॉग प्रश्नोत्तर (Ask SmogShield)" : "Ask SmogShield Follow-Up"}
        </h3>
        <p className="text-xs text-slate-500">
          Grounded Q&A strictly scoped to air quality and health protection
        </p>
      </div>
    </div>
  );
}

function QuickPrompts({
  onSelect,
}: {
  readonly onSelect: (text: string) => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_PROMPTS.map((prompt, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(prompt)}
          className="min-h-[44px] rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-sky-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-sky-950/40"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

interface MessageListProps {
  readonly messages: readonly ChatMessage[];
  readonly isLoading: boolean;
}

function MessageList({ messages, isLoading }: MessageListProps): React.JSX.Element {
  return (
    <div
      aria-live="polite"
      className="flex max-h-72 min-h-[140px] flex-col gap-3 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
    >
      {messages.length === 0 && (
        <p className="my-auto text-center text-xs text-slate-400">
          Ask any question about outdoor safety, masks, purifiers, or timing routines.
        </p>
      )}
      {messages.map((m, idx) => (
        <div
          key={idx}
          className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${
            m.role === "user"
              ? "ml-auto rounded-br-none bg-sky-600 text-white"
              : "mr-auto rounded-bl-none border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          }`}
        >
          {m.content}
        </div>
      ))}
      {isLoading && (
        <div className="mr-auto animate-pulse rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800">
          Thinking...
        </div>
      )}
    </div>
  );
}

interface InputFormProps {
  readonly input: string;
  readonly isLoading: boolean;
  readonly onInputChange: (v: string) => void;
  readonly onSubmit: () => void;
}

function ChatInputForm({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: InputFormProps): React.JSX.Element {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex gap-2"
    >
      <input
        type="text"
        value={input}
        maxLength={300}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Ask a question about your air quality..."
        className="min-h-[44px] flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      <Button type="submit" variant="primary" disabled={isLoading || !input.trim()}>
        <Send className="mr-1.5 h-4 w-4" aria-hidden="true" />
        <span>Send</span>
      </Button>
    </form>
  );
}

function useChatAssistant(context: {
  locationName: string;
  aqi: number;
  riskTier: string;
  summary: string;
  language: "en" | "hi";
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, context, history: messages.slice(-4) }),
      });
      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      const fallback =
        "Unable to process request right now. Please refer to your plan recommendations above.";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, input, setInput, isLoading, sendMessage };
}

export function ChatPanel({
  locationName,
  aqi,
  riskTier,
  summary,
  language = "en",
}: ChatPanelProps): React.JSX.Element {
  const { messages, input, setInput, isLoading, sendMessage } = useChatAssistant({
    locationName,
    aqi,
    riskTier,
    summary,
    language,
  });

  return (
    <section
      aria-label="Air Quality Assistant Q&A"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <ChatHeader language={language} />
      <QuickPrompts onSelect={sendMessage} />
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInputForm
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSubmit={() => sendMessage(input)}
      />
    </section>
  );
}
