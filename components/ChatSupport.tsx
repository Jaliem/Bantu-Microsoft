"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

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
        { role: "model", content: "Maaf, terjadi kendala koneksi. Silakan coba beberapa saat lagi." },
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
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-brand-mid text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-dark transition-all cursor-pointer group border-none outline-none"
          >
            <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-dark rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
              1
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 w-[420px] h-[640px] bg-white rounded-[2.5rem] shadow-ambient border border-brand-dark/5 flex flex-col overflow-hidden"
          >
            
            {/* Header */}
            <div className="bg-brand-mid px-10 py-10 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-white font-display font-bold text-sm uppercase tracking-[0.2em]">Bantu Support</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer p-2 hover:bg-white/10 rounded-full border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              data-lenis-prevent
              className="flex-1 overflow-y-auto p-8 space-y-8 bg-brand-light"
            >
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-brand-mid/10">
                    <span className="text-brand-mid font-display font-bold text-xl">B</span>
                  </div>
                  <h4 className="font-display font-bold text-brand-dark text-xl mb-4 tracking-tight">Pusat Bantuan</h4>
                  <p className="text-sm text-brand-dark/40 leading-relaxed max-w-[280px] mx-auto font-sans font-light">
                    Halo! Tanyakan apa saja seputar layanan BANTU. Kami siap membantu operasional Anda.
                  </p>
                  
                  <div className="mt-12 flex flex-col gap-3 items-center">
                    {["Apa itu BANTU?", "Cara kerja escrow?", "Verifikasi akun"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-[10px] font-display font-bold uppercase tracking-widest bg-white px-8 py-4 rounded-2xl border border-brand-dark/5 text-brand-dark/60 hover:border-brand-mid hover:text-brand-mid transition-all cursor-pointer shadow-sm w-full"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-brand-dark/20 mb-3 px-1">
                    {msg.role === "user" ? "Anda" : "Assistant"}
                  </p>
                  <div
                    className={`max-w-[85%] px-6 py-5 text-sm leading-relaxed font-sans shadow-sm ${
                      msg.role === "user"
                        ? "bg-brand-mid text-white rounded-[1.5rem] rounded-tr-none"
                        : "bg-white text-brand-dark rounded-[1.5rem] rounded-tl-none border border-brand-dark/5"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start">
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-brand-dark/20 mb-3 px-1">Assistant</p>
                  <div className="bg-white px-8 py-5 rounded-[1.5rem] rounded-tl-none border border-brand-dark/5 shadow-sm">
                    <div className="flex gap-2">
                      <div className="w-1 h-1 bg-brand-mid/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1 h-1 bg-brand-mid/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1 h-1 bg-brand-mid/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white border-t border-brand-dark/5 shrink-0">
              <div className="flex items-center gap-4 bg-brand-light rounded-2xl px-6 py-2 border border-brand-dark/5 focus-within:bg-white focus-within:border-brand-mid/30 transition-all shadow-inner">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesan Anda..."
                  className="flex-1 bg-transparent text-sm text-brand-dark placeholder:text-brand-dark/20 outline-none py-4 font-sans"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="bg-brand-mid text-white p-3 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-30 shrink-0 border-none outline-none cursor-pointer shadow-lg shadow-brand-mid/20"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="flex justify-center mt-6">
                <p className="text-[8px] text-brand-dark/15 font-bold uppercase tracking-[0.3em]">
                  Powered by Advanced AI System
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
