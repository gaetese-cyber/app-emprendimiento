"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  module: "facturacion" | "contabilidad" | "sociedades" | "general";
  placeholder?: string;
  suggestions?: string[];
  systemLabel?: string;
}

export default function AIChat({ module, placeholder, suggestions, systemLabel }: AIChatProps) {
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Mensaje = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/contador/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, module }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.error}` }]);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "No pude conectarme. Revisá tu conexión e intentá de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--color-bottle)", color: "white" }}
            >
              <Bot size={28} />
            </div>
            <div className="text-center">
              <p className="font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
                {systemLabel ?? "Asistente IA"}
              </p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Escribí tu consulta o usá una de las sugerencias.
              </p>
            </div>
            {suggestions && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-sm px-3 py-1.5 rounded-full border transition-colors hover:border-transparent"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-muted)",
                      background: "white",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: m.role === "user" ? "var(--color-navy)" : "var(--color-bottle)",
                color: "white",
              }}
            >
              {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm"
              style={{
                background: m.role === "user" ? "var(--color-navy)" : "white",
                color: m.role === "user" ? "white" : "var(--color-ink)",
                border: m.role === "assistant" ? "1px solid var(--color-border-soft)" : "none",
                borderRadius: m.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
              }}
            >
              {m.role === "assistant" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    code: ({ children }) => (
                      <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--color-cream)" }}>
                        {children}
                      </code>
                    ),
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--color-bottle)", color: "white" }}
            >
              <Bot size={14} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: "white", border: "1px solid var(--color-border-soft)" }}
            >
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--color-muted)" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: "var(--color-border-soft)" }}>
        <div
          className="flex items-end gap-3 p-3 rounded-xl border"
          style={{ background: "white", borderColor: "var(--color-border)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder ?? "Escribí tu consulta..."}
            rows={1}
            className="flex-1 resize-none text-sm outline-none bg-transparent"
            style={{
              color: "var(--color-ink)",
              maxHeight: "120px",
              lineHeight: "1.5",
            }}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background: "var(--color-navy)", color: "white" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--color-muted)" }}>
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
