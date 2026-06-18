import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, Send, User, Shield, Terminal, Loader2, Sparkles, AlertCircle, HelpCircle 
} from "lucide-react";
import { ChatMessage } from "../types";

export default function AiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_1",
      role: "model",
      content: "Secure baseline connection established. I am your Google Gemini AI Security Assistant initialized with threat intelligence databases. How can I protect you or what threat vector should we investigate today?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const promptChips = [
    "What is Log4Shell CVE vulnerability?",
    "Check safety parameters for a young URL",
    "How dangerous is an open SSH Port 22?",
    "Explain double-extortion ransomware"
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const chatContext = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatContext })
      });

      if (!res.ok) throw new Error("Could not fetch co-pilot feedback.");

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "model",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now() + 2}`,
        role: "model",
        content: "⚠ CO-PILOT CORRECTION: Secure socket connection timed out while querying the Gemini model. Verify GEMINI_API_KEY inside workspace panel.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-assistant-module" className="flex flex-col h-[600px] border border-slate-800/50 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-md font-mono shadow-xl">
      
      {/* Assistant Header banner */}
      <div className="p-4 border-b border-slate-800/50 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-2">
              SECURITY CO-PILOT
              <span className="text-[9px] bg-blue-950/65 text-blue-300 font-bold border border-blue-500/20 px-1 py-0.5 rounded animate-pulse">
                GEMINI 3.5
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">Forensic cybersecurity intelligence agent</p>
          </div>
        </div>
        <div className="text-[9px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 shadow-sm">
          TLS 1.3 ENCRYPTION ACTIVE
        </div>
      </div>

      {/* Messages stream area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            id={`chat-msg-${message.id}`}
          >
            {/* Avatar icon */}
            <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center border ${
              message.role === "user" 
                ? "bg-blue-950/40 border-blue-500/20 text-blue-450" 
                : message.content.startsWith("⚠") 
                ? "bg-red-950/40 border-red-500/20 text-red-400"
                : "bg-indigo-950/40 border-indigo-500/20 text-indigo-400"
            }`}>
              {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Content card */}
            <div className={`p-3.5 rounded-xl border ${
              message.role === "user" 
                ? "bg-blue-950/30 border-blue-800/40 text-blue-100" 
                : message.content.startsWith("⚠")
                ? "bg-red-950/15 border-red-900/30 text-red-200"
                : "bg-slate-900/50 border-slate-800/50 text-slate-200"
            }`}>
              <div className="text-xs whitespace-pre-line leading-relaxed">
                {message.content}
              </div>
              <span className="block text-[9px] text-slate-500 mt-2 text-right">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>

          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 flex items-center gap-2">
              <span className="text-xs text-slate-500">Co-pilot is investigating security catalogs...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-850 bg-slate-900/10 flex gap-2 overflow-x-auto select-none no-scrollbar">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 text-[10px] bg-slate-950/60 border border-slate-800 text-slate-400 rounded-md hover:text-white hover:border-blue-500/40 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input container footer */}
      <div className="p-3 border-t border-slate-850 bg-slate-900/30 flex gap-2 items-center">
        <input 
          id="chat-user-input"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(inputMessage)}
          placeholder="Inquire threat profile, verify code syntax, analyze CVE..."
          className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
          disabled={loading}
        />
        <button 
          id="chat-send-btn"
          onClick={() => handleSend(inputMessage)}
          disabled={loading || !inputMessage.trim()}
          className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
