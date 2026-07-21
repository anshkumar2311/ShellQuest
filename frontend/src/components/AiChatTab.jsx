import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Send, User, Terminal, Sparkles } from "lucide-react";
import { createApiClient } from "../lib/api.js";

export default function AiChatTab() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your ShellQuest AI study partner. Ask me anything about Linux commands — e.g. \"what does chmod 755 do?\" or \"explain git commit -m\"."
    },
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
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Something went wrong reaching the AI. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-base h-[560px] flex flex-col overflow-hidden">
      {/* Header/Title */}
      <div className="px-5 py-3 border-b border-hairline/60 bg-sand-deep/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-rust" />
          <span className="font-semibold text-sm text-coffee">Linux AI Assistant</span>
          <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse" />
        </div>
        <span className="text-xs text-coffee-soft font-mono font-medium">Groq API</span>
      </div>

      {/* Messages Scroll Panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-card/25 scrollbar-custom">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={i}
              className={`flex items-start gap-3 animate-[fadeIn_0.3s_ease-out] ${
                isUser ? "justify-end text-right" : "justify-start text-left"
              }`}
            >
              {/* Bot Avatar (Left side) */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-lavender-light border border-lavender-soft/40 flex items-center justify-center text-lavender-dark flex-shrink-0 shadow-sm">
                  <Terminal size={14} />
                </div>
              )}

              {/* Chat Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border text-left ${
                  isUser
                    ? "bg-coffee text-sand border-coffee-soft rounded-tr-none"
                    : "bg-lavender-light/45 text-lavender-dark border-lavender-soft/30 rounded-tl-none"
                }`}
              >
                {m.text}
              </div>

              {/* User Avatar (Right side) */}
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-rust border border-hairline/40 flex items-center justify-center text-sand flex-shrink-0 shadow-sm">
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-lavender-light border border-lavender-soft/40 flex items-center justify-center text-lavender-dark flex-shrink-0 shadow-sm">
              <Terminal size={14} />
            </div>
            <div className="bg-lavender-light/45 text-lavender-dark border border-lavender-soft/30 rounded-2xl rounded-tl-none px-4 py-3 text-sm font-mono">
              thinking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Form Panel (Sticky Bottom) */}
      <div className="border-t border-hairline/60 p-4 bg-sand-deep/20 flex gap-2.5 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask a command e.g., 'what does chmod 755 mean?'"
          className="input-base"
        />
        <button
          onClick={send}
          disabled={loading}
          className="btn-primary inline-flex items-center gap-1.5 px-6 py-3"
        >
          <Send size={14} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
