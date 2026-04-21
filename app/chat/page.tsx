"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { Search, MoreHorizontal, Paperclip, Image as ImageIcon, Smile, Send, Info, Download, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import EmojiPicker from 'emoji-picker-react';

const MOCK_CHATS = [
  { id: "1", name: "Aris Designer", active: true, status: "Typing...", time: "12:45 PM", avatar: "https://i.pravatar.cc/150?img=11" },
  { id: "2", name: "Siti Socmed", active: false, status: "The content calendar is ready for review!", time: "Yesterday", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "3", name: "Budi Dev", active: false, status: "API integration is 90% complete.", time: "Mon", avatar: "https://i.pravatar.cc/150?img=12" },
];

export default function ChatPage() {
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // UI States
  const [showDetails, setShowDetails] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Close emoji picker when clicking outside could be added here, but omitted for brevity
  // just relying on toggle for now.

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
    <div className="flex h-screen bg-[#faf8ff] font-sans overflow-hidden">
      <Sidebar userData={{ name: user.displayName || "User", role: "UMKM", avatarUrl: user.photoURL }} />

      {/* Messages List Column */}
      <div className="w-[320px] bg-[#faf8ff] border-r border-[#bccabc]/15 flex flex-col shrink-0">
        <div className="p-6 pb-4">
          <h1 className="text-2xl font-bold text-[#131b2e] font-display mb-6">Messages</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3d4a3f] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-white border border-[#bccabc]/20 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#006d38] shadow-[0_2px_10px_rgba(19,27,46,0.02)] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {MOCK_CHATS.map((chat) => (
            <div 
              key={chat.id} 
              className={`flex items-center gap-3 p-3 rounded-[16px] cursor-pointer transition-colors ${chat.active ? 'bg-white shadow-[0_4px_20px_rgba(19,27,46,0.03)] border border-[#bccabc]/10' : 'hover:bg-white/50 border border-transparent'}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                {chat.active && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00aa5b] border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-[#131b2e] text-sm truncate">{chat.name}</h3>
                  <span className="text-[10px] text-[#3d4a3f] font-semibold">{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${chat.active ? 'text-[#00aa5b] font-semibold' : 'text-[#3d4a3f]'}`}>
                  {chat.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className="flex-1 flex flex-col bg-white relative">
        <div className="h-[88px] border-b border-[#bccabc]/15 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?img=11" alt="Aris" className="w-12 h-12 rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00aa5b] border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-bold text-[#131b2e] text-lg font-display leading-tight">Aris Designer</h2>
              <p className="text-[10px] text-[#3d4a3f] font-bold tracking-wider uppercase mt-0.5">
                ACTIVE NOW • PROJECT: LOGO REVISIONS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#3d4a3f]">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${showDetails ? 'bg-[#dae2fd] text-[#006d38]' : 'hover:bg-[#f2f3ff]'}`}
            >
              <Info size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#faf8ff]">
          <div className="flex justify-center mb-8">
            <span className="bg-white text-[#3d4a3f] text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-[#bccabc]/20 shadow-sm">
              Today
            </span>
          </div>

          {displayMessages.map((msg: any, idx: number) => {
            const isMe = msg.senderId === user.uid;
            
            return (
              <div key={msg.id || idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img 
                  src={isMe ? (user.photoURL || "https://i.pravatar.cc/150?img=33") : "https://i.pravatar.cc/150?img=11"} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-auto" 
                />
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {msg.isFile ? (
                    <div className="bg-[#f2f3ff] p-4 rounded-[24px] border border-[#bccabc]/20 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00aa5b] rounded-[16px] flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden">
                        {msg.fileUrl?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                           <img src={msg.fileUrl} className="w-full h-full object-cover" alt="attachment" />
                        ) : (
                           <ImageIcon size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#131b2e] text-sm truncate max-w-[200px]">{msg.fileName}</h4>
                        <p className="text-xs text-[#3d4a3f] mt-0.5">{msg.fileSize}</p>
                      </div>
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white rounded-full transition-colors cursor-pointer text-[#131b2e]">
                        <Download size={18} />
                      </a>
                    </div>
                  ) : (
                    <div className={`p-4 text-sm leading-relaxed ${
                      isMe 
                        ? 'bg-gradient-to-br from-[#006d38] to-[#00aa5b] text-white rounded-[24px] rounded-br-[8px] shadow-[0_4px_15px_rgba(0,109,56,0.15)] whitespace-pre-wrap' 
                        : 'bg-[#f2f3ff] text-[#131b2e] rounded-[24px] rounded-bl-[8px] border border-[#bccabc]/15 shadow-sm whitespace-pre-wrap'
                    }`}>
                      {msg.text}
                    </div>
                  )}

                  <div className={`text-[10px] text-[#3d4a3f] font-semibold mt-1.5 flex items-center gap-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                    {msg.time || new Date(msg.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && <span className="text-[#00aa5b] ml-1">✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-[90px] right-24 z-50 shadow-2xl">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className="p-6 bg-white border-t border-[#bccabc]/15 relative z-10">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <form className="bg-[#f2f3ff] rounded-[24px] p-2 flex items-end gap-2 border border-[#bccabc]/20 focus-within:border-[#006d38] focus-within:ring-1 focus-within:ring-[#006d38] transition-all">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2.5 text-[#3d4a3f] hover:text-[#131b2e] hover:bg-white rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {uploading ? <div className="w-5 h-5 border-2 border-[#3d4a3f] border-t-transparent rounded-full animate-spin"></div> : <Paperclip size={20} />}
            </button>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2.5 text-[#3d4a3f] hover:text-[#131b2e] hover:bg-white rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <ImageIcon size={20} />
            </button>
            
            <textarea 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..." 
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[#131b2e] px-2 py-2.5 resize-none max-h-[100px]"
              rows={1}
            />
            
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 text-[#3d4a3f] hover:text-[#131b2e] hover:bg-white rounded-full transition-colors cursor-pointer shrink-0"
            >
              <Smile size={20} />
            </button>
            <button 
              type="button"
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="w-12 h-12 bg-[#006d38] text-white rounded-full flex items-center justify-center hover:bg-[#00aa5b] transition-colors cursor-pointer shadow-md disabled:opacity-50 shrink-0"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[9px] text-[#3d4a3f] font-bold uppercase tracking-wider">
              ENTER TO SEND • SHIFT + ENTER FOR NEW LINE
            </span>
          </div>
        </div>
      </div>

      {/* Chat Details Column (Toggleable) */}
      {showDetails && (
        <div className="w-[320px] bg-[#f2f3ff] border-l border-[#bccabc]/15 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-8 flex flex-col items-center border-b border-[#bccabc]/15">
            <img src="https://i.pravatar.cc/150?img=11" alt="Aris Designer" className="w-24 h-24 rounded-full object-cover shadow-md mb-4 border-4 border-white" />
            <h2 className="text-xl font-bold text-[#131b2e] font-display">Aris Designer</h2>
            <p className="text-xs text-[#3d4a3f] mt-1 font-medium">UI/UX Specialist • Top Rated</p>
            
            <div className="flex items-center gap-2 mt-4">
              <span className="bg-[#00aa5b] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">Verified</span>
              <span className="bg-[#dae2fd] text-[#006d38] text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider">Pro</span>
            </div>
          </div>

          <div className="p-8 border-b border-[#bccabc]/15">
            <h3 className="text-[10px] font-bold text-[#3d4a3f] uppercase tracking-wider mb-4">Current Project</h3>
            <div className="bg-white p-5 rounded-[24px] border border-[#bccabc]/20 shadow-[0_4px_15px_rgba(19,27,46,0.02)]">
              <h4 className="font-bold text-[#131b2e] text-sm mb-3">Logo Identity Rebranding</h4>
              <div className="w-full bg-[#f2f3ff] rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-[#00aa5b] h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-[#006d38]">65% Complete</span>
                <span className="text-[#3d4a3f]">Due Oct 24</span>
              </div>
            </div>
          </div>

          <div className="p-8 flex-1">
            <h3 className="text-[10px] font-bold text-[#3d4a3f] uppercase tracking-wider mb-4">Shared Files</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 bg-white border border-[#bccabc]/20 rounded-[12px] flex items-center justify-center text-[#006d38] shadow-sm group-hover:border-[#006d38] transition-colors">
                  <Paperclip size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#131b2e] group-hover:text-[#006d38] transition-colors">Brand_Guidelines.pdf</h4>
                  <p className="text-[10px] text-[#3d4a3f] mt-0.5 font-medium">2.8 MB • 2 days ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 mt-auto">
            <button className="w-full bg-red-50 text-red-600 font-bold text-xs py-3 rounded-[16px] hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-100">
              <AlertCircle size={14} />
              Report User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
