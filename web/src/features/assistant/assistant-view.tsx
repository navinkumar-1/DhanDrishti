"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Card, PageHeader } from "@/components/ui/primitives";
import { api } from "@/lib/api";
import { tx, useI18n } from "@/lib/i18n";
import type { Copy } from "@/types/domain";

const suggestions = [
  "Why is my portfolio concentrated?",
  "Explain this bond in Hindi",
  "Which of my accounts holds this REIT?",
  "What could go wrong with this InvIT?",
];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
}

export function AssistantView() {
  const params = useSearchParams();
  const { language, setLanguage } = useI18n();
  const [draft, setDraft] = useState(params.get("q") ?? "");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || pending) return;
    setDraft("");
    setMessages((current) => [...current, { role: "user", text: question }]);
    setPending(true);
    const reply = await api.ask(question, language);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setMessages((current) => [
      ...current,
      { role: "assistant", text: tx(language, reply.text as Copy), sources: reply.sources },
    ]);
    setPending(false);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader
        title="Ask"
        subtitle="Explains your data. Does not give personal buy or sell advice."
        action={
          <button type="button" onClick={() => setLanguage(language === "en" ? "hi" : "en")} className="rounded-full border border-border px-3 py-1.5 text-[13px]">
            {language === "en" ? "English" : "हिंदी"}
          </button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {suggestions.map((question) => (
          <button key={question} type="button" onClick={() => void send(question)} className="rounded-full border border-border bg-surface px-3 py-1.5 text-left text-[13px]">
            {question}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[80%] rounded-[16px] rounded-br-[4px] bg-primary px-4 py-3 text-[14px] text-white" : "max-w-[90%] rounded-[16px] bg-surface-muted px-4 py-3 text-[14px]"}>
            <p className="leading-6">{message.text}</p>
            {message.sources && message.sources.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.sources.map((source) => (
                  <span key={source} className="rounded-full bg-primary-tint px-2 py-1 text-[12px] text-primary">
                    {source}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {pending ? <p className="text-[14px] text-text-secondary">···</p> : null}
      </div>
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about your imported data" className="h-12 flex-1 rounded-full border border-border bg-surface px-4 text-[14px] outline-none" />
        <button type="submit" className="grid h-12 w-12 place-items-center rounded-full bg-primary text-white" aria-label="Send">
          ↑
        </button>
      </form>
      <Card className="mt-4 text-[12px] text-text-tertiary">AI-generated explanation, based on the sources shown. Missing Hindi in a reply falls back to the reviewed English line when a Hindi line is absent.</Card>
    </div>
  );
}
