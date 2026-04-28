"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Paperclip, Image as ImageIcon, Smile, Send, Info, Download, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from "framer-motion";

const MOCK_CHATS = [
  { id: "1", name: "Aris Designer", active: true, status: "Typing...", time: "12:45 PM", avatar: "https://i.pravatar.cc/150?img=11" },
  { id: "2", name: "Siti Socmed", active: false, status: "The content calendar is ready for review!", time: "Yesterday", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "3", name: "Budi Dev", active: false, status: "API integration is 90% complete.", time: "Mon", avatar: "https://i.pravatar.cc/150?img=12" },
];

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // UI States
  const [showDetails, setShowDetails] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, "chats", "chat_1", "messages"), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user) return;

    const textToSend = inputText;
    setInputText("");
    setShowEmojiPicker(false);

    try {
      await addDoc(collection(db, "chats", "chat_1", "messages"), {
        text: textToSend,
        senderId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        
        await addDoc(collection(db, "chats", "chat_1", "messages"), {
          isFile: true,
          fileName: file.name,
          fileUrl: data.url,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          senderId: user.uid,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("File upload error", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const displayMessages = messages.length > 0 ? messages : [
    { id: "m1", senderId: "aris", text: "Halo! I've finished the initial concept for the \"BANTU\" logo. I went with a modern emerald gradient to reflect the Indonesian creative spirit.", time: "12:30 PM" },
    { id: "m2", senderId: "aris", isFile: true, fileName: "Bantu_Logo_v1_Draft.png", fileSize: "4.2 MB", time: "12:30 PM" },
    { id: "m3", senderId: user?.uid || "me", text: "This looks fantastic, Aris! Could we try making the \"B\" slightly more rounded? I want it to feel even more approachable for our UMKM partners.", time: "12:35 PM" }
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen bg-brand-light font-sans overflow-y-auto pt-20">
      
      {/* Messages List Column */}
      <div className="w-[320px] bg-brand-light border-r border-brand-dark/5 flex flex-col shrink-0 h-full">
        <div className="p-8 pb-6">
          <h1 className="text-3xl font-display font-semibold text-brand-dark mb-6 tracking-tight">Messages</h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30 w-4 h-4 group-focus-within:text-brand-mid transition-colors" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-white border border-brand-dark/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:border-brand-mid shadow-ambient transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 hide-scrollbar">
          {MOCK_CHATS.map((chat) => (
            <motion.div 
              key={chat.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all duration-300 ${chat.active ? 'bg-white shadow-ambient border border-brand-dark/5' : 'hover:bg-white/40 border border-transparent'}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                {chat.active && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-mid border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-display font-bold text-brand-dark text-sm truncate">{chat.name}</h3>
                  <span className="text-[10px] text-brand-dark/30 font-bold uppercase">{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${chat.active ? 'text-brand-mid font-semibold' : 'text-brand-dark/50'}`}>
                  {chat.status}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className="flex-1 flex flex-col bg-white relative h-full">
        <div className="h-[90px] border-b border-brand-dark/5 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?img=11" alt="Aris" className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-mid border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-display font-bold text-brand-dark text-xl leading-tight">Aris Designer</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-brand-mid animate-pulse"></span>
                <p className="text-[10px] text-brand-dark/40 font-bold tracking-[0.15em] uppercase">
                  ACTIVE NOW • LOGO REVISIONS
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className={`p-3 rounded-2xl transition-all cursor-pointer ${showDetails ? 'bg-brand-mid/10 text-brand-mid' : 'hover:bg-brand-light text-brand-dark/40'}`}
            >
              <Info size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-brand-light/30 hide-scrollbar">
          <div className="flex justify-center mb-10">
            <span className="glass text-brand-dark/40 text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full border border-brand-dark/5 shadow-ambient">
              Today
            </span>
          </div>

          <AnimatePresence>
            {displayMessages.map((msg: any, idx: number) => {
              const isMe = msg.senderId === user.uid;
              
              return (
                <motion.div 
                  key={msg.id || idx} 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <img 
                    src={isMe ? (user.photoURL || "https://i.pravatar.cc/150?img=33") : "https://i.pravatar.cc/150?img=11"} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-xl object-cover shrink-0 mt-auto shadow-sm" 
                  />
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {msg.isFile ? (
                      <div className="bg-white p-5 rounded-[2rem] border border-brand-dark/5 shadow-ambient flex items-center gap-5">
                        <div className="w-14 h-14 bg-brand-mid rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-mid/20 overflow-hidden">
                          {msg.fileUrl?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                             <img src={msg.fileUrl} className="w-full h-full object-cover" alt="attachment" />
                          ) : (
                             <ImageIcon size={22} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-bold text-brand-dark text-sm truncate">{msg.fileName}</h4>
                          <p className="text-[10px] text-brand-dark/40 font-bold uppercase mt-1">{msg.fileSize}</p>
                        </div>
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center hover:bg-brand-mid hover:text-white transition-all cursor-pointer text-brand-dark/60">
                          <Download size={18} />
                        </a>
                      </div>
                    ) : (
                      <div className={`p-5 text-sm leading-relaxed font-sans ${
                        isMe 
                          ? 'bg-brand-mid text-white rounded-[2rem] rounded-br-[0.5rem] shadow-lg shadow-brand-mid/10' 
                          : 'bg-white text-brand-dark rounded-[2rem] rounded-bl-[0.5rem] border border-brand-dark/5 shadow-ambient'
                      }`}>
                        {msg.text}
                      </div>
                    )}

                    <div className={`text-[9px] text-brand-dark/30 font-bold uppercase mt-2 flex items-center gap-2 ${isMe ? 'mr-2' : 'ml-2'}`}>
                      {msg.time || new Date(msg.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <span className="text-brand-mid">✓✓</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-[110px] right-10 z-50 shadow-2xl rounded-3xl overflow-hidden border border-brand-dark/5">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className="p-8 bg-white border-t border-brand-dark/5 shrink-0">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-brand-light/50 rounded-[2.5rem] p-3 flex items-end gap-3 border border-brand-dark/5 focus-within:bg-white focus-within:border-brand-mid focus-within:ring-4 focus-within:ring-brand-mid/5 transition-all duration-500">
              <div className="flex items-center gap-1 pl-2 mb-1.5">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-3 text-brand-dark/40 hover:text-brand-mid hover:bg-brand-mid/10 rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {uploading ? <div className="w-5 h-5 border-2 border-brand-mid border-t-transparent rounded-full animate-spin"></div> : <Paperclip size={20} />}
                </button>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-3 text-brand-dark/40 hover:text-brand-mid hover:bg-brand-mid/10 rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <ImageIcon size={20} />
                </button>
              </div>
              
              <textarea 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..." 
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-brand-dark px-2 py-3.5 resize-none max-h-[120px] font-sans placeholder:text-brand-dark/30"
                rows={1}
              />
              
              <div className="flex items-center gap-2 pr-2 mb-1.5">
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-3 text-brand-dark/40 hover:text-brand-mid hover:bg-brand-mid/10 rounded-full transition-all cursor-pointer shrink-0"
                >
                  <Smile size={20} />
                </button>
                <button 
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="w-14 h-14 bg-brand-mid text-white rounded-full flex items-center justify-center hover:bg-brand-dark hover:scale-105 transition-all cursor-pointer shadow-lg shadow-brand-mid/20 disabled:opacity-50 disabled:scale-100 shrink-0"
                >
                  <Send size={22} className="ml-1" />
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <span className="text-[9px] text-brand-dark/20 font-bold uppercase tracking-[0.25em]">
                Enter to send • Shift + Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Details Column (Toggleable) */}
      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-brand-light/50 border-l border-brand-dark/5 flex flex-col shrink-0 overflow-y-auto h-full hide-scrollbar"
          >
            <div className="p-10 flex flex-col items-center border-b border-brand-dark/5">
              <div className="relative mb-6">
                <img src="https://i.pravatar.cc/150?img=11" alt="Aris Designer" className="w-28 h-28 rounded-[2.5rem] object-cover shadow-ambient border-4 border-white" />
                <div className="absolute -bottom-2 -right-2 bg-brand-mid text-white p-2 rounded-2xl shadow-lg">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-1">Pro</span>
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold text-brand-dark">Aris Designer</h2>
              <p className="text-xs text-brand-dark/50 mt-1.5 font-sans font-medium">UI/UX Specialist • Top Rated</p>
              
              <div className="flex items-center gap-3 mt-6">
                <div className="bg-white px-4 py-2 rounded-2xl border border-brand-dark/5 shadow-sm text-center">
                  <p className="text-xs font-display font-bold text-brand-dark">4.9</p>
                  <p className="text-[8px] text-brand-dark/30 font-bold uppercase tracking-tighter">Rating</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-brand-dark/5 shadow-sm text-center">
                  <p className="text-xs font-display font-bold text-brand-dark">128</p>
                  <p className="text-[8px] text-brand-dark/30 font-bold uppercase tracking-tighter">Projects</p>
                </div>
              </div>
            </div>

            <div className="p-10 border-b border-brand-dark/5">
              <h3 className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mb-6">Current Project</h3>
              <div className="bg-white p-6 rounded-[2rem] border border-brand-dark/5 shadow-ambient">
                <h4 className="font-display font-bold text-brand-dark text-sm mb-4">Logo Identity Rebranding</h4>
                <div className="w-full bg-brand-light rounded-full h-2 mb-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-brand-mid h-full rounded-full"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-brand-mid uppercase tracking-wider">65% Complete</span>
                  <span className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-wider">Due Oct 24</span>
                </div>
              </div>
            </div>

            <div className="p-10 flex-1">
              <h3 className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mb-6">Shared Assets</h3>
              <div className="space-y-4">
                {[
                  { name: "Brand_Guidelines.pdf", size: "2.8 MB", date: "2 days ago" },
                  { name: "Logo_Draft_v2.png", size: "4.5 MB", date: "Yesterday" }
                ].map((file, i) => (
                  <div key={i} className="flex items-center gap-4 cursor-pointer group">
                    <div className="w-12 h-12 bg-white border border-brand-dark/5 rounded-2xl flex items-center justify-center text-brand-mid shadow-sm group-hover:bg-brand-mid group-hover:text-white transition-all duration-300">
                      <Paperclip size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-display font-bold text-brand-dark truncate group-hover:text-brand-mid transition-colors">{file.name}</h4>
                      <p className="text-[9px] text-brand-dark/40 mt-0.5 font-bold uppercase">{file.size} • {file.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 mt-auto">
              <button className="w-full bg-red-50 text-red-600 font-display font-bold text-[10px] uppercase tracking-widest py-4 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-100/50">
                <AlertCircle size={14} />
                Report User
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
