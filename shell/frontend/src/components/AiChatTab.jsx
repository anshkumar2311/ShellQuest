import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Send } from "lucide-react";
import { createApiClient } from "../lib/api.js";

export default function AiChatTab() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Ask me anything about a Linux command — e.g. \"what does chmod 755 do?\"" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const api = createApiClient(getToken);
      const { data } = await api.post("/api/ai-chat", { message: text });
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong reaching the AI. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-hairline bg-card flex flex-col h-[520px]">
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                "inline-block max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed " +
                (m.role === "user" ? "bg-coffee text-sand" : "bg-sand-deep text-coffee")
              }
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && <div className="text-sm text-coffee-soft font-mono">thinking…</div>}
        <div ref={endRef} />
      </div>
      <div className="border-t border-hairline p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="e.g. what does chmod 755 mean?"
          className="flex-1 rounded-md border border-hairline bg-sand px-3 py-2 text-sm outline-none focus:border-rust"
        />
        <button
          onClick={send}
          disabled={loading}
          className="rounded-md bg-rust text-sand px-4 py-2 text-sm font-medium hover:brightness-110 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <Send size={14} /> Send
        </button>
      </div>
    </div>
  );
}
