import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Send, User, Terminal, Sparkles, MessageSquarePlus, Clock } from "lucide-react";
import { createApiClient } from "../lib/api.js";

const DEFAULT_MESSAGES = [
  {
    role: "assistant",
    text: "Hello! I am your ShellQuest AI study partner. Ask me anything about Linux commands — e.g. \"what does chmod 755 do?\" or \"explain git commit -m\"."
  }
];

export default function AiChatTab() {
  const { getToken } = useAuth();
  
  // State for active chat
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatTitle, setChatTitle] = useState("New Conversation");
  const [chatSummary, setChatSummary] = useState("");
  
  // State for sidebar chat history
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    fetchChatHistory();
  }, [getToken]);

  async function fetchChatHistory() {
    try {
      const api = createApiClient(getToken);
      const { data } = await api.get("/api/ai-chat");
      if (data.chats) {
        setChatHistory(data.chats);
      }
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function loadChat(selectedChatId) {
    if (chatId === selectedChatId) return;
    try {
      setLoading(true);
      const api = createApiClient(getToken);
      const { data } = await api.get(`/api/ai-chat/${selectedChatId}`);
      if (data.chat) {
        setChatId(data.chat.id);
        setChatTitle(data.chat.title || "Linux AI Assistant");
        setChatSummary(data.chat.summary || "");
        
        if (data.chat.messages && data.chat.messages.length > 0) {
          const formattedMessages = data.chat.messages.map(m => ({
            role: m.role,
            text: m.content || m.text // fallback just in case
          }));
          setMessages(formattedMessages);
        } else {
          setMessages(DEFAULT_MESSAGES);
        }
      }
    } catch (err) {
      console.error("Failed to load chat", err);
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    setChatId(null);
    setChatTitle("New Conversation");
    setChatSummary("");
    setMessages(DEFAULT_MESSAGES);
    setInput("");
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    
    const isFirstMessage = !chatId;

    try {
      const api = createApiClient(getToken);
      const payload = { message: text };
      if (chatId) payload.chatId = chatId;
      const { data } = await api.post("/api/ai-chat", payload);
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
      if (data.chatId) setChatId(data.chatId);
      if (data.title) setChatTitle(data.title);
      if (data.summary) setChatSummary(data.summary);

      if (isFirstMessage) {
        // Refresh sidebar so the new chat shows up
        fetchChatHistory();
      }
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
    <div className="card-base h-[600px] flex overflow-hidden">
      
      {/* Sidebar: Chat History */}
      <div className="w-64 border-r border-hairline/60 bg-sand-deep/10 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-hairline/60">
          <button 
            onClick={startNewChat}
            className="w-full btn-primary px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm"
          >
            <MessageSquarePlus size={16} /> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-custom p-2 space-y-1">
          <h3 className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-coffee-soft">
            Recent Conversations
          </h3>
          {loadingHistory ? (
            <div className="px-3 py-4 text-xs font-mono text-coffee-soft text-center animate-pulse">Loading...</div>
          ) : chatHistory.length === 0 ? (
            <div className="px-3 py-4 text-xs text-coffee-soft text-center">No past chats.</div>
          ) : (
            chatHistory.map((c) => {
              const isActive = c.id === chatId;
              return (
                <button
                  key={c.id}
                  onClick={() => loadChat(c.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 border flex flex-col gap-1 ${
                    isActive 
                      ? "bg-coffee/5 border-coffee/20 shadow-sm" 
                      : "bg-transparent border-transparent hover:bg-sand-deep/30"
                  }`}
                >
                  <span className={`text-sm font-bold truncate ${isActive ? "text-coffee" : "text-coffee-soft"}`}>
                    {c.title || "Untitled Chat"}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-coffee-soft/70">
                    <Clock size={10} />
                    <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header/Title */}
        <div className="px-5 py-3 border-b border-hairline/60 bg-sand-deep/20 flex flex-col gap-1 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Sparkles size={16} className="text-rust flex-shrink-0" />
              <span className="font-semibold text-sm text-coffee truncate">{chatTitle}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse flex-shrink-0" />
            </div>
            <span className="text-xs text-coffee-soft font-mono font-medium flex-shrink-0">Groq API</span>
          </div>
          {chatSummary && (
            <p className="text-[10px] text-coffee-soft font-mono truncate">{chatSummary}</p>
          )}
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
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border text-left break-words ${
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
        <div className="border-t border-hairline/60 p-4 bg-sand-deep/20 flex gap-2.5 items-center flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask a command e.g., 'what does chmod 755 mean?'"
            className="input-base"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="btn-primary inline-flex items-center gap-1.5 px-6 py-3 disabled:opacity-50"
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
