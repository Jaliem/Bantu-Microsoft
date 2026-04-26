"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-[#006d38] to-[#00aa5b] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,143,76,0.4)] hover:shadow-[0_8px_40px_rgba(0,143,76,0.5)] hover:scale-105 transition-all cursor-pointer group"
          aria-label="Open chat support"
        >
          <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-white">
            ?
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[560px] bg-white rounded-[28px] shadow-[0_20px_60px_rgba(19,27,46,0.15)] border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#006d38] to-[#00aa5b] px-6 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">BANTU Support</h3>
                <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors cursor-pointer p-1 hover:bg-white/10 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fe]">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#e6f4ea] to-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot size={32} className="text-[#008f4c]" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Hi! I'm BANTU Assistant 👋</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                  Ask me anything about BANTU — posting jobs, applying for work, payments, verification, and more!
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {["What is BANTU?", "How to post a job?", "How to apply?"].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="text-[11px] bg-white px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#008f4c] hover:text-[#008f4c] transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === "user"
                      ? "bg-[#111827] text-white"
                      : "bg-gradient-to-br from-[#006d38] to-[#00aa5b] text-white"
                  }`}
                >
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#111827] text-white rounded-[20px] rounded-br-[6px]"
                      : "bg-white text-gray-800 rounded-[20px] rounded-bl-[6px] border border-gray-100 shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#006d38] to-[#00aa5b] text-white flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white px-4 py-3 rounded-[20px] rounded-bl-[6px] border border-gray-100 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-[#f8f9fe] rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-[#008f4c] transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about BANTU..."
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none py-1"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-9 h-9 bg-[#008f4c] text-white rounded-xl flex items-center justify-center hover:bg-[#007a41] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-2 font-medium">
              AI responses may not always be accurate. For urgent help, contact support@bantu.com
            </p>
          </div>
        </div>
      )}
    </>
  );
}
