"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Paperclip, Image as ImageIcon, Smile, Send, Info, Download, AlertCircle, MessageSquare, CheckCircle2, Star, X, MapPin, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, doc, getDoc, updateDoc } from "firebase/firestore";
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: any;
  participants: string[];
  unreadCount?: number;
}

interface ParticipantInfo {
  uid: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  university?: string;
  location?: string;
  isOnline?: boolean;
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

  const [otherParticipant, setOtherParticipant] = useState<ParticipantInfo | null>(null);
  const [participantsCache, setParticipantsCache] = useState<Record<string, ParticipantInfo>>({});

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFilePreview, setPendingFilePreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showDetails, setShowDetails] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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

      if (chatList.length > 0 && !selectedChatId) {
        setSelectedChatId(chatList[0].id);
      }
    }, (error) => {
      console.error("Error fetching chats:", error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedChatId || !user || chats.length === 0) return;

    const currentChat = chats.find(c => c.id === selectedChatId);
    if (!currentChat) return;

    const otherId = currentChat.participants.find(p => p !== user.uid);
    if (!otherId) return;

    const unsubscribe = onSnapshot(doc(db, "users", otherId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const info = {
          uid: otherId,
          name: data.name || "User",
          avatarUrl: data.avatarUrl || "",
          role: data.role,
          university: data.university,
          location: data.location,
          isOnline: data.isOnline
        };
        setOtherParticipant(info);
        setParticipantsCache(prev => ({ ...prev, [otherId]: info }));
      }
    }, (error) => {
      console.error("Error fetching other participant:", error);
    });

    return () => unsubscribe();
  }, [selectedChatId, user, chats]);

  useEffect(() => {
    if (!user || chats.length === 0) return;

    const fetchAllParticipants = async () => {
      const missingIds = chats
        .map(c => c.participants.find(p => p !== user.uid))
        .filter((id): id is string => !!id && !participantsCache[id]);

      if (missingIds.length === 0) return;

      const uniqueIds = Array.from(new Set(missingIds));
      const newCacheEntries: Record<string, ParticipantInfo> = {};

      try {
        await Promise.all(uniqueIds.map(async (id) => {
          const docRef = doc(db, "users", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            newCacheEntries[id] = {
              uid: id,
              name: data.name || "User",
              avatarUrl: data.avatarUrl || "",
              role: data.role,
              university: data.university
            };
          }
        }));

        if (Object.keys(newCacheEntries).length > 0) {
          setParticipantsCache(prev => ({ ...prev, ...newCacheEntries }));
        }
      } catch (error) {
        console.error("Error fetching all participants:", error);
      }
    };

    fetchAllParticipants();
  }, [chats, user]);

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
    if (!inputText.trim() && !pendingFile) return;
    if (!user || !selectedChatId) return;

    const textToSend = inputText.trim();
    const fileToSend = pendingFile;

    setInputText("");
    setPendingFile(null);
    setPendingFilePreview(null);
    setShowEmojiPicker(false);

    try {
      if (fileToSend) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", fileToSend);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (res.ok) {
          const data = await res.json();
          const isImage = fileToSend.type.startsWith('image/');

          await addDoc(collection(db, "chats", selectedChatId, "messages"), {
            isFile: true,
            isImage: isImage,
            fileName: fileToSend.name,
            fileUrl: data.url,
            fileSize: `${(fileToSend.size / 1024 / 1024).toFixed(2)} MB`,
            text: textToSend || null,
            senderId: user.uid,
            senderName: user.displayName || "User",
            createdAt: serverTimestamp()
          });

          await updateDoc(doc(db, "chats", selectedChatId), {
            lastMessage: isImage ? `📷 Foto` : `📎 ${fileToSend.name}`,
            lastMessageTime: serverTimestamp()
          });
        }
        setUploading(false);
      } else if (textToSend) {
        await addDoc(collection(db, "chats", selectedChatId, "messages"), {
          text: textToSend,
          senderId: user.uid,
          senderName: user.displayName || "User",
          createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, "chats", selectedChatId), {
          lastMessage: textToSend,
          lastMessageTime: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setUploading(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setPendingFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPendingFilePreview(url);
    } else {
      setPendingFilePreview(null);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const otherId = chat.participants.find(p => p !== user?.uid);
    const cachedInfo = otherId ? participantsCache[otherId] : null;
    const displayName = cachedInfo?.name || chat.name || "";
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1c14' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase">Loading</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Build a flat list with date-divider entries injected between day groups
  const messagesWithDividers = (() => {
    const items: any[] = [];
    let lastDateKey = "";
    messages.forEach((msg, idx) => {
      const msgDate = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
      const dateKey = format(msgDate, "yyyy-MM-dd");
      if (dateKey !== lastDateKey) {
        let label = "";
        if (isToday(msgDate)) label = "Today";
        else if (isYesterday(msgDate)) label = "Yesterday";
        else label = format(msgDate, "MMMM d, yyyy");
        items.push({ _isDivider: true, label, key: `divider-${dateKey}` });
        lastDateKey = dateKey;
      }
      items.push({ ...msg, _isDivider: false });
    });
    return items;
  })();

  return (
    <div className="flex h-screen overflow-hidden pt-20" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* ── Sidebar ── */}
      <div
        className="w-[320px] flex flex-col shrink-0 h-full"
        style={{ background: '#0b1c14' }}
      >
        {/* Sidebar header */}
        <div className="px-7 pt-8 pb-5">
          <h1
            className="text-2xl font-bold text-white mb-5 tracking-tight"
            style={{ fontFamily: 'var(--font-jakarta), sans-serif', letterSpacing: '-0.03em' }}
          >
            Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm bg-white/8 border border-white/8 text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 hide-scrollbar">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat, i) => {
              const otherId = chat.participants.find(p => p !== user.uid);
              const cachedInfo = otherId ? participantsCache[otherId] : null;
              const displayName = cachedInfo?.name || chat.name || "Conversation";
              const displayAvatar = cachedInfo?.avatarUrl || chat.avatar || "https://i.pravatar.cc/150?u=" + chat.id;
              const isActive = selectedChatId === chat.id;

              return (
                <motion.button
                  key={chat.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedChatId(chat.id)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-left"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(255,255,255,0.08)' : 'transparent'}`
                  }}
                >
                  <div className="relative shrink-0">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-11 h-11 rounded-2xl object-cover"
                      style={{ border: isActive ? '2px solid #006d38' : '2px solid rgba(255,255,255,0.08)' }}
                    />
                    {cachedInfo?.isOnline && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{ background: '#006d38', borderColor: '#0b1c14' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span
                        className="font-bold text-sm truncate"
                        style={{
                          fontFamily: 'var(--font-jakarta), sans-serif',
                          color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)'
                        }}
                      >
                        {displayName}
                      </span>
                      <span className="text-[10px] ml-2 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {chat.lastMessageTime?.toDate
                          ? formatDistanceToNow(chat.lastMessageTime.toDate(), { addSuffix: false })
                          : ""}
                      </span>
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: isActive ? '#4ade80' : 'rgba(255,255,255,0.35)' }}
                    >
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <MessageSquare size={24} style={{ color: 'rgba(255,255,255,0.15)' }} />
              </div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {searchQuery ? "No results" : "No conversations"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col h-full min-w-0" style={{ background: '#f8f6f1' }}>
        {selectedChatId ? (
          <>
            {/* Chat header */}
            <div
              className="h-[68px] flex items-center justify-between px-8 shrink-0"
              style={{ background: '#ffffff', borderBottom: '1px solid rgba(11,28,20,0.06)' }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={otherParticipant?.avatarUrl || selectedChat?.avatar || "https://i.pravatar.cc/150?u=" + selectedChatId}
                    alt="Avatar"
                    className="w-10 h-10 rounded-xl object-cover"
                    style={{ border: '2px solid rgba(0,109,56,0.15)' }}
                  />
                  {otherParticipant?.isOnline && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ background: '#006d38' }}
                    />
                  )}
                </div>
                <div>
                  <h2
                    className="font-bold text-base leading-tight"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif', color: '#0b1c14', letterSpacing: '-0.02em' }}
                  >
                    {otherParticipant?.name || selectedChat?.name || "Loading…"}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {otherParticipant?.isOnline ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: '#006d38' }}>
                          Active now
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/20" />
                        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: 'rgba(11,28,20,0.3)' }}>
                          Offline
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2.5 rounded-xl transition-all cursor-pointer"
                style={{
                  background: showDetails ? 'rgba(0,109,56,0.08)' : 'transparent',
                  color: showDetails ? '#006d38' : 'rgba(11,28,20,0.3)'
                }}
              >
                <Info size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-4 hide-scrollbar" data-lenis-prevent>
              <AnimatePresence initial={false}>
                {messagesWithDividers.length > 0 ? (
                  messagesWithDividers.map((item: any, idx: number) => {
                    if (item._isDivider) {
                      return (
                        <div key={item.key} className="flex items-center gap-4 py-2">
                          <div className="flex-1 h-px" style={{ background: 'rgba(11,28,20,0.08)' }} />
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full shrink-0"
                            style={{ color: 'rgba(11,28,20,0.35)', background: 'rgba(11,28,20,0.04)' }}
                          >
                            {item.label}
                          </span>
                          <div className="flex-1 h-px" style={{ background: 'rgba(11,28,20,0.08)' }} />
                        </div>
                      );
                    }

                    const msg = item;
                    const isMe = msg.senderId === user.uid;
                    const avatar = isMe
                      ? (user.photoURL || "https://i.pravatar.cc/150?u=" + user.uid)
                      : (otherParticipant?.avatarUrl || selectedChat?.avatar || "https://i.pravatar.cc/150?u=" + selectedChatId);

                    // Find the previous non-divider item for avatar grouping
                    const prevMsg = messagesWithDividers.slice(0, idx).reverse().find((x: any) => !x._isDivider);
                    const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                    return (
                      <motion.div
                        key={msg.id || idx}
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        {showAvatar ? (
                          <img
                            src={avatar}
                            alt="Avatar"
                            className="w-8 h-8 rounded-xl object-cover shrink-0 mt-auto"
                            style={{ border: '1.5px solid rgba(11,28,20,0.08)' }}
                          />
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}

                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[65%]`}>
                          {msg.isFile ? (
                            msg.isImage || (msg.fileUrl && typeof msg.fileUrl === 'string' && msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                              <div className="flex flex-col gap-2">
                                <div className="relative group overflow-hidden rounded-[1.25rem]" style={{ border: '1px solid rgba(11,28,20,0.07)' }}>
                                  <img src={msg.fileUrl} alt="attachment" className="max-w-[240px] max-h-[300px] object-cover" />
                                  <a
                                    href={msg.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Download size={14} />
                                  </a>
                                </div>
                                {msg.text && (
                                  <div
                                    className="px-4 py-3 text-sm leading-relaxed"
                                    style={{
                                      borderRadius: isMe ? '1.25rem 1.25rem 0.35rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.35rem',
                                      background: isMe ? '#006d38' : '#ffffff',
                                      color: isMe ? '#ffffff' : '#0b1c14',
                                      border: isMe ? 'none' : '1px solid rgba(11,28,20,0.07)',
                                      boxShadow: isMe ? '0 4px 16px rgba(0,109,56,0.18)' : '0 2px 12px rgba(11,28,20,0.06)'
                                    }}
                                  >
                                    {msg.text}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <div
                                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
                                  style={{
                                    background: '#ffffff',
                                    border: '1px solid rgba(11,28,20,0.07)',
                                    boxShadow: '0 2px 12px rgba(11,28,20,0.06)'
                                  }}
                                >
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                                    style={{ background: '#006d38' }}
                                  >
                                    <Paperclip size={16} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs truncate" style={{ color: '#0b1c14', fontFamily: 'var(--font-jakarta), sans-serif' }}>
                                      {msg.fileName}
                                    </p>
                                    <p className="text-[10px] mt-0.5 font-semibold uppercase tracking-wider" style={{ color: 'rgba(11,28,20,0.35)' }}>
                                      {msg.fileSize}
                                    </p>
                                  </div>
                                  <a
                                    href={msg.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                    style={{ background: 'rgba(0,109,56,0.08)', color: '#006d38' }}
                                  >
                                    <Download size={14} />
                                  </a>
                                </div>
                                {msg.text && (
                                  <div
                                    className="px-4 py-3 text-sm leading-relaxed"
                                    style={{
                                      borderRadius: isMe ? '1.25rem 1.25rem 0.35rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.35rem',
                                      background: isMe ? '#006d38' : '#ffffff',
                                      color: isMe ? '#ffffff' : '#0b1c14',
                                      border: isMe ? 'none' : '1px solid rgba(11,28,20,0.07)',
                                      boxShadow: isMe ? '0 4px 16px rgba(0,109,56,0.18)' : '0 2px 12px rgba(11,28,20,0.06)'
                                    }}
                                  >
                                    {msg.text}
                                  </div>
                                )}
                              </div>
                            )
                          ) : (
                            <div
                              className="px-4 py-3 text-sm leading-relaxed"
                              style={{
                                borderRadius: isMe
                                  ? '1.25rem 1.25rem 0.35rem 1.25rem'
                                  : '1.25rem 1.25rem 1.25rem 0.35rem',
                                background: isMe ? '#006d38' : '#ffffff',
                                color: isMe ? '#ffffff' : '#0b1c14',
                                border: isMe ? 'none' : '1px solid rgba(11,28,20,0.07)',
                                boxShadow: isMe
                                  ? '0 4px 16px rgba(0,109,56,0.18)'
                                  : '0 2px 12px rgba(11,28,20,0.06)',
                                fontFamily: 'var(--font-inter), sans-serif'
                              }}
                            >
                              {msg.text}
                            </div>
                          )}

                          <div
                            className="flex items-center gap-1.5 mt-1.5 px-1"
                            style={{ color: 'rgba(11,28,20,0.3)' }}
                          >
                            <span className="text-[10px] font-semibold">
                              {msg.createdAt?.toDate
                                ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Just now'}
                            </span>
                            {isMe && (
                              <span className="text-[10px] font-bold" style={{ color: '#006d38' }}>✓✓</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : !loadingMessages && (
                  <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                    <MessageSquare size={36} className="mb-3" style={{ color: '#0b1c14' }} />
                    <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#0b1c14' }}>
                      Start the conversation
                    </p>
                  </div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji picker */}
            {showEmojiPicker && (
              <div
                className="absolute bottom-[84px] right-10 z-50 rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 20px 60px rgba(11,28,20,0.15)', border: '1px solid rgba(11,28,20,0.08)' }}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            {/* Pending File Preview */}
            {pendingFile && (
              <div className="px-8 pt-4 pb-2" style={{ background: '#ffffff', borderTop: '1px solid rgba(11,28,20,0.06)' }}>
                <div className="relative inline-block" style={{ background: '#f8f6f1', borderRadius: '1rem', border: '1px solid rgba(11,28,20,0.08)', padding: '0.5rem' }}>
                  <button 
                    onClick={() => { setPendingFile(null); setPendingFilePreview(null); }}
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-all z-10 cursor-pointer"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                  {pendingFilePreview ? (
                    <img src={pendingFilePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" style={{ border: '1px solid rgba(11,28,20,0.05)' }} />
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,109,56,0.1)' }}>
                        <Paperclip size={18} style={{ color: '#006d38' }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold truncate max-w-[120px]" style={{ color: '#0b1c14' }}>{pendingFile.name}</p>
                        <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: 'rgba(11,28,20,0.4)' }}>
                          {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Input bar */}
            <div
              className={`px-8 pb-4 ${!pendingFile ? 'pt-4' : 'pt-2'} shrink-0`}
              style={{ background: '#ffffff', borderTop: pendingFile ? 'none' : '1px solid rgba(11,28,20,0.06)' }}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <input type="file" accept="image/*" ref={imageInputRef} onChange={handleFileUpload} className="hidden" />
              <div
                className="flex items-end gap-2 rounded-2xl p-1.5 transition-all duration-300"
                style={{
                  background: '#f8f6f1',
                  border: '1.5px solid rgba(11,28,20,0.08)',
                }}
              >
                <div className="flex items-center pl-1 mb-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                    style={{ color: 'rgba(11,28,20,0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#006d38')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(11,28,20,0.35)')}
                  >
                    {uploading
                      ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      : <Paperclip size={17} />
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                    style={{ color: 'rgba(11,28,20,0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#006d38')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(11,28,20,0.35)')}
                  >
                    <ImageIcon size={17} />
                  </button>
                </div>

                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm resize-none max-h-[80px] py-2 px-1"
                  style={{
                    color: '#0b1c14',
                    fontFamily: 'var(--font-inter), sans-serif',
                  }}
                  rows={1}
                />

                <div className="flex items-center gap-1 pr-1 mb-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 rounded-xl transition-all cursor-pointer"
                    style={{ color: showEmojiPicker ? '#006d38' : 'rgba(11,28,20,0.35)' }}
                    onMouseEnter={e => !showEmojiPicker && (e.currentTarget.style.color = '#006d38')}
                    onMouseLeave={e => !showEmojiPicker && (e.currentTarget.style.color = 'rgba(11,28,20,0.35)')}
                  >
                    <Smile size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={(!inputText.trim() && !pendingFile) || uploading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95"
                    style={{
                      background: '#006d38',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(0,109,56,0.3)'
                    }}
                  >
                    {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} className="ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div
              className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6"
              style={{ background: '#ffffff', border: '1px solid rgba(11,28,20,0.06)', boxShadow: '0 8px 32px rgba(11,28,20,0.06)' }}
            >
              <MessageSquare size={36} style={{ color: 'rgba(11,28,20,0.12)' }} />
            </div>
            <h3
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-jakarta), sans-serif', color: '#0b1c14', letterSpacing: '-0.03em' }}
            >
              Pilih percakapan
            </h3>
            <p className="text-sm max-w-[240px]" style={{ color: 'rgba(11,28,20,0.4)', lineHeight: 1.6 }}>
              Pilih pesan di samping untuk mulai berdiskusi tentang proyek Anda.
            </p>
          </div>
        )}
      </div>

      {/* ── Details panel — flex sibling column ── */}
      <AnimatePresence>
        {showDetails && selectedChatId && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col shrink-0 overflow-y-auto hide-scrollbar"
            style={{
              background: '#ffffff',
              borderLeft: '1px solid rgba(11,28,20,0.07)',
            }}
          >
            <div className="p-8 flex flex-col items-center" style={{ borderBottom: '1px solid rgba(11,28,20,0.06)' }}>
              <div className="relative mb-5">
                <img
                  src={otherParticipant?.avatarUrl || selectedChat?.avatar || "https://i.pravatar.cc/150?u=" + selectedChatId}
                  alt="Avatar"
                  className="w-20 h-20 rounded-[1.5rem] object-cover"
                  style={{ border: '3px solid rgba(0,109,56,0.12)' }}
                />
                <div
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl shadow-md"
                  style={{ background: '#006d38' }}
                >
                  <CheckCircle2 size={11} className="text-white" />
                </div>
              </div>
              <h2
                className="text-lg font-bold text-center"
                style={{ fontFamily: 'var(--font-jakarta), sans-serif', color: '#0b1c14', letterSpacing: '-0.02em' }}
              >
                {otherParticipant?.name || selectedChat?.name || "Participant"}
              </h2>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mt-1" style={{ color: 'rgba(11,28,20,0.35)' }}>
                {otherParticipant?.role || "Verified User"}
              </p>

              {otherParticipant?.uid && (
                <button
                  onClick={() => {
                    if (otherParticipant.role === "Mahasiswa") {
                      router.push(`/portfolio/${otherParticipant.uid}`);
                    } else {
                      router.push(`/umkm/${otherParticipant.uid}`);
                    }
                  }}
                  className="mt-5 text-[11px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                  style={{
                    background: 'rgba(0,109,56,0.07)',
                    color: '#006d38',
                    border: '1px solid rgba(0,109,56,0.12)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#006d38';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0,109,56,0.07)';
                    e.currentTarget.style.color = '#006d38';
                  }}
                >
                  Lihat Profil
                </button>
              )}
            </div>

            {/* About Section */}
            <div className="px-8 py-7" style={{ borderBottom: '1px solid rgba(11,28,20,0.06)' }}>
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(11,28,20,0.3)' }}>
                About
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(11,28,20,0.04)' }}>
                    <MapPin size={14} style={{ color: 'rgba(11,28,20,0.4)' }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(11,28,20,0.25)' }}>Location</p>
                    <p className="text-xs font-semibold" style={{ color: '#0b1c14' }}>{otherParticipant?.location || "Not specified"}</p>
                  </div>
                </div>
                {otherParticipant?.university && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(11,28,20,0.04)' }}>
                      <Trophy size={14} style={{ color: 'rgba(11,28,20,0.4)' }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(11,28,20,0.25)' }}>University</p>
                      <p className="text-xs font-semibold" style={{ color: '#0b1c14' }}>{otherParticipant.university}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shared Media Section */}
            <div className="px-8 py-7">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(11,28,20,0.3)' }}>
                  Shared Media
                </h3>
                <span className="text-[10px] font-bold" style={{ color: '#006d38' }}>
                  {messages.filter(m => m.isFile).length}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {messages.filter(m => m.isFile).slice(-4).reverse().map((msg, i) => (
                  <a 
                    key={msg.id || i}
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-xl overflow-hidden relative group"
                    style={{ background: 'rgba(11,28,20,0.04)', border: '1px solid rgba(11,28,20,0.06)' }}
                  >
                    {msg.isImage ? (
                      <img src={msg.fileUrl} alt="shared" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Paperclip size={16} style={{ color: 'rgba(11,28,20,0.2)' }} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Download size={14} className="text-white" />
                    </div>
                  </a>
                ))}
              </div>
              
              {messages.filter(m => m.isFile).length === 0 && (
                <div className="py-8 flex flex-col items-center justify-center opacity-20">
                  <ImageIcon size={24} className="mb-2" />
                  <p className="text-[9px] font-bold uppercase tracking-widest">No shared media</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
