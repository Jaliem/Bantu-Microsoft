"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Paperclip, Image as ImageIcon, Smile, Send, Info, Download, AlertCircle, MessageSquare, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, doc, getDoc } from "firebase/firestore";
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: any;
  participants: string[];
  unreadCount?: number;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // UI States
  const [showDetails, setShowDetails] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch Chat List
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "chats"), 
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      setChats(chatList);
      
      // Auto-select first chat if none selected
      if (chatList.length > 0 && !selectedChatId) {
        setSelectedChatId(chatList[0].id);
      }
    }, (error) => {
      console.error("Error fetching chats:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch Messages for Selected Chat
  useEffect(() => {
    if (!selectedChatId || !user) return;
    
    setLoadingMessages(true);
    setSelectedChat(chats.find(c => c.id === selectedChatId) || null);

    const q = query(
      collection(db, "chats", selectedChatId, "messages"), 
      orderBy("createdAt", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 100);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedChatId, user, chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user || !selectedChatId) return;

    const textToSend = inputText;
    setInputText("");
    setShowEmojiPicker(false);

    try {
      await addDoc(collection(db, "chats", selectedChatId, "messages"), {
        text: textToSend,
        senderId: user.uid,
        senderName: user.displayName || "User",
        createdAt: serverTimestamp()
      });
      
      // Update last message in chat document
      // (Optional: Implement a Firebase Cloud Function for this or update here)
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
    if (!e.target.files || e.target.files.length === 0 || !user || !selectedChatId) return;
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
        
        await addDoc(collection(db, "chats", selectedChatId, "messages"), {
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

  if (authLoading) {
    return (
      <div className="bg-brand-light min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-brand-light font-sans overflow-hidden pt-20">
      
      {/* Messages List Column */}
      <div className="w-[340px] bg-brand-light border-r border-brand-dark/5 flex flex-col shrink-0 h-full">
        <div className="p-8 pb-6">
          <h1 className="text-3xl font-display font-semibold text-brand-dark mb-6 tracking-tight">Messages</h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30 w-4 h-4 group-focus-within:text-brand-mid transition-colors" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full bg-white border border-brand-dark/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:border-brand-mid shadow-ambient transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 hide-scrollbar">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <motion.div 
                key={chat.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all duration-300 ${selectedChatId === chat.id ? 'bg-white shadow-ambient border border-brand-dark/5' : 'hover:bg-white/40 border border-transparent'}`}
              >
                <div className="relative">
                  <img src={chat.avatar || "https://i.pravatar.cc/150?u=" + chat.id} alt={chat.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-mid border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-display font-bold text-brand-dark text-sm truncate">{chat.name || "Conversation"}</h3>
                    <span className="text-[10px] text-brand-dark/30 font-bold uppercase">
                      {chat.lastMessageTime?.toDate ? formatDistanceToNow(chat.lastMessageTime.toDate(), { addSuffix: false }) : ""}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${selectedChatId === chat.id ? 'text-brand-mid font-semibold' : 'text-brand-dark/50'}`}>
                    {chat.lastMessage || "No messages yet"}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-16 h-16 bg-brand-dark/5 rounded-3xl flex items-center justify-center text-brand-dark/10 mb-4">
                <MessageSquare size={32} />
              </div>
              <p className="text-brand-dark/30 font-display font-bold text-xs uppercase tracking-widest">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className="flex-1 flex flex-col bg-white relative h-full">
        {selectedChatId ? (
          <>
            <div className="h-[80px] border-b border-brand-dark/5 flex items-center justify-between px-10 shrink-0">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img src={selectedChat?.avatar || "https://i.pravatar.cc/150?u=" + selectedChatId} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-brand-mid border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h2 className="font-display font-bold text-brand-dark text-lg leading-tight">{selectedChat?.name || "Loading..."}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-brand-mid animate-pulse"></span>
                    <p className="text-[9px] text-brand-dark/40 font-bold tracking-[0.15em] uppercase">
                      ACTIVE NOW
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${showDetails ? 'bg-brand-mid/10 text-brand-mid' : 'hover:bg-brand-light text-brand-dark/40'}`}
                >
                  <Info size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-brand-light/20 hide-scrollbar" data-lenis-prevent>
              <AnimatePresence>
                {messages.length > 0 ? (
                  messages.map((msg: any, idx: number) => {
                    const isMe = msg.senderId === user.uid;
                    
                    return (
                      <motion.div 
                        key={msg.id || idx} 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <img 
                          src={isMe ? (user.photoURL || "https://i.pravatar.cc/150?u=" + user.uid) : (selectedChat?.avatar || "https://i.pravatar.cc/150?u=" + selectedChatId)} 
                          alt="Avatar" 
                          className="w-9 h-9 rounded-xl object-cover shrink-0 mt-auto shadow-sm" 
                        />
                        
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          {msg.isFile ? (
                            <div className="bg-white p-4 rounded-[1.75rem] border border-brand-dark/5 shadow-ambient flex items-center gap-4">
                              <div className="w-12 h-12 bg-brand-mid rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-mid/20 overflow-hidden">
                                {msg.fileUrl?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                  <img src={msg.fileUrl} className="w-full h-full object-cover" alt="attachment" />
                                ) : (
                                  <ImageIcon size={20} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-display font-bold text-brand-dark text-xs truncate">{msg.fileName}</h4>
                                <p className="text-[9px] text-brand-dark/40 font-bold uppercase mt-0.5">{msg.fileSize}</p>
                              </div>
                              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-brand-light rounded-full flex items-center justify-center hover:bg-brand-mid hover:text-white transition-all cursor-pointer text-brand-dark/60">
                                <Download size={16} />
                              </a>
                            </div>
                          ) : (
                            <div className={`p-4 text-sm leading-relaxed font-sans ${
                              isMe 
                                ? 'bg-brand-mid text-white rounded-[1.75rem] rounded-br-[0.4rem] shadow-lg shadow-brand-mid/10' 
                                : 'bg-white text-brand-dark rounded-[1.75rem] rounded-bl-[0.4rem] border border-brand-dark/5 shadow-ambient'
                            }`}>
                              {msg.text}
                            </div>
                          )}

                          <div className={`text-[8px] text-brand-dark/30 font-bold uppercase mt-1.5 flex items-center gap-2 ${isMe ? 'mr-1.5' : 'ml-1.5'}`}>
                            {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            {isMe && <span className="text-brand-mid">✓✓</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : !loadingMessages && (
                  <div className="flex flex-col items-center justify-center h-full opacity-20">
                    <MessageSquare size={48} className="mb-4" />
                    <p className="font-display font-bold text-xs uppercase tracking-[0.2em]">Start a conversation</p>
                  </div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-[80px] right-10 z-50 shadow-2xl rounded-3xl overflow-hidden border border-brand-dark/5">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            <div className="p-6 bg-white border-t border-brand-dark/5 shrink-0">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <div className="max-w-3xl mx-auto relative">
                <div className="bg-brand-light/50 rounded-[1.5rem] p-1.5 flex items-end gap-1.5 border border-brand-dark/5 focus-within:bg-white focus-within:border-brand-mid focus-within:ring-4 focus-within:ring-brand-mid/5 transition-all duration-500">
                  <div className="flex items-center gap-0 pl-1 mb-0.5">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-2 text-brand-dark/40 hover:text-brand-mid hover:bg-brand-mid/10 rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {uploading ? <div className="w-4 h-4 border-2 border-brand-mid border-t-transparent rounded-full animate-spin"></div> : <Paperclip size={18} />}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-2 text-brand-dark/40 hover:text-brand-mid hover:bg-brand-mid/10 rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <ImageIcon size={18} />
                    </button>
                  </div>
                  
                  <textarea 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-brand-dark px-1 py-2 resize-none max-h-[80px] font-sans placeholder:text-brand-dark/25"
                    rows={1}
                  />
                  
                  <div className="flex items-center gap-1 pr-1 mb-0.5">
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-brand-dark/40 hover:text-brand-mid hover:bg-brand-mid/10 rounded-full transition-all cursor-pointer shrink-0"
                    >
                      <Smile size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className="w-9 h-9 bg-brand-mid text-white rounded-full flex items-center justify-center hover:bg-brand-dark hover:scale-105 transition-all cursor-pointer shadow-lg shadow-brand-mid/20 disabled:opacity-50 disabled:scale-100 shrink-0"
                    >
                      <Send size={16} className="ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-brand-light/10 text-center p-10">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-ambient flex items-center justify-center text-brand-dark/5 mb-8 border border-brand-dark/5">
              <MessageSquare size={48} />
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-dark mb-2">Pilih percakapan</h3>
            <p className="text-brand-dark/40 max-w-xs font-sans font-light">Pilih salah satu pesan di samping untuk mulai berdiskusi mengenai proyek Anda.</p>
          </div>
        )}
      </div>

      {/* Chat Details Column (Toggleable) */}
      <AnimatePresence>
        {(showDetails && selectedChatId) && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-brand-light/50 border-l border-brand-dark/5 flex flex-col shrink-0 overflow-y-auto h-full hide-scrollbar"
          >
            <div className="p-10 flex flex-col items-center border-b border-brand-dark/5">
              <div className="relative mb-6">
                <img src={selectedChat?.avatar || "https://i.pravatar.cc/150?u=" + selectedChatId} alt="Avatar" className="w-24 h-24 rounded-[2rem] object-cover shadow-ambient border-4 border-white" />
                <div className="absolute -bottom-1 -right-1 bg-brand-mid text-white p-1.5 rounded-xl shadow-lg">
                  <CheckCircle2 size={12} />
                </div>
              </div>
              <h2 className="text-xl font-display font-bold text-brand-dark">{selectedChat?.name || "Participant"}</h2>
              <p className="text-[10px] text-brand-dark/40 mt-1 font-sans font-bold uppercase tracking-widest">Verified User</p>
            </div>

            <div className="p-10 flex-1">
              <h3 className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mb-6">Informasi</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white border border-brand-dark/5 rounded-xl flex items-center justify-center text-brand-mid shadow-sm">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest">Status</h4>
                    <p className="text-xs font-display font-bold text-brand-dark">Kolaborasi Aktif</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 mt-auto">
              <button className="w-full bg-red-50 text-red-600 font-display font-bold text-[9px] uppercase tracking-widest py-4 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-100/50">
                Report Conversation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
