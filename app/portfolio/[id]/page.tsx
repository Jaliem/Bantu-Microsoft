"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle2, Download, ArrowRight, Star, Loader2, Trophy, MessageSquare, MapPin, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PortfolioEntry {
  id: string;
  projectTitle: string;
  category: string;
  budget: string;
  clientName?: string;
  description: string;
  aiScore?: number;
  aiGrade?: string;
  rating?: number;
  review?: string;
  completedAt: any;
  verified: boolean;
  isHidden?: boolean;
}

interface StudentProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  university?: string;
  bio?: string;
  skills?: string[];
  rank?: string;
  completedTasks?: number;
  avgRating?: number;
  hideAiScores?: boolean;
  hideRatings?: boolean;
}

const gradeColor: Record<string, string> = {
  S: "text-yellow-600 bg-yellow-50 border-yellow-200",
  A: "text-green-600 bg-green-50 border-green-200",
  B: "text-blue-600 bg-blue-50 border-blue-200",
  C: "text-orange-600 bg-orange-50 border-orange-200",
  D: "text-red-600 bg-red-50 border-red-200",
};

const categoryIcon: Record<string, string> = {
  "Design": "🎨",
  "Writing": "✍️",
  "Data": "📊",
  "Video": "🎬",
  "Marketing": "📣",
  "Admin": "📋",
  "Tech": "💻",
};

export default function PortfolioPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, userData } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as StudentProfile);
        }

        // Fetch verified portfolio entries (Live Ledger)
        const q = query(
          collection(db, "portfolioEntries"),
          where("userId", "==", id),
          orderBy("completedAt", "desc")
        );
        const snap = await getDocs(q);
        const entryList: PortfolioEntry[] = snap.docs
          .map(d => ({
            id: d.id,
            ...d.data(),
          } as PortfolioEntry))
          .filter(e => !e.isHidden); // Filter out hidden entries
        setEntries(entryList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPortfolio();
  }, [id]);

  const handleChat = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk menghubungi talent.");
      router.push("/login");
      return;
    }

    if (user.uid === id) {
      toast.error("Anda tidak dapat mengirim pesan ke diri sendiri.");
      return;
    }

    setChatLoading(true);
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", user.uid)
      );
      const querySnapshot = await getDocs(q);

      let existingChatId = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(id)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        router.push(`/chat?id=${existingChatId}`);
      } else {
        // Create new chat
        const newChatRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, id],
          name: profile?.name || "User",
          avatar: profile?.avatarUrl || "",
          lastMessage: "Halo, saya tertarik untuk bekerja sama dengan Anda.",
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        // Add initial message
        await addDoc(collection(db, "chats", newChatRef.id, "messages"), {
          text: "Halo, saya tertarik untuk bekerja sama dengan Anda.",
          senderId: user.uid,
          senderName: userData?.name || user.displayName || "User",
          createdAt: serverTimestamp()
        });

        router.push(`/chat?id=${newChatRef.id}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Gagal memulai percakapan.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleDownload = () => {
    const originalTitle = document.title;
    document.title = ""; // Clears the page title from the print header
    window.print();
    document.title = originalTitle;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-brand-dark font-display">Portfolio tidak ditemukan</h1>
        <Link href="/marketplace" className="text-brand-mid font-bold">Kembali ke Marketplace</Link>
      </div>
    );
  }

  const rankConfig: Record<string, { color: string; bg: string; label: string }> = {
    S: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Rank S — Elite Talent" },
    A: { color: "text-green-700", bg: "bg-green-100", label: "Rank A — Senior Talent" },
    B: { color: "text-blue-700", bg: "bg-blue-100", label: "Rank B — Skilled Talent" },
    C: { color: "text-orange-700", bg: "bg-orange-100", label: "Rank C — Rising Talent" },
    D: { color: "text-brand-dark/60", bg: "bg-brand-dark/5", label: "Rank D — New Talent" },
  };
  const rank = profile.rank || "D";
  const rankCfg = rankConfig[rank] || rankConfig["D"];

  return (
    <div className="bg-background flex flex-col font-sans text-brand-dark w-full min-h-screen selection:bg-brand-mid/20 selection:text-brand-mid print:min-h-0 print:bg-white">
      <main className="flex-grow pt-32 pb-24 px-6 max-w-7xl mx-auto w-full relative print:hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-1/2 bg-radial from-brand-mid/5 to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-16 mb-24 relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 z-10 text-center lg:text-left"
          >
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
              <div className="inline-flex items-center gap-1.5 bg-brand-mid/10 text-brand-mid px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                <CheckCircle2 size={12} /> Verified Student Talent
              </div>
              <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${rankCfg.color} ${rankCfg.bg}`}>
                <Trophy size={12} /> {rankCfg.label}
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] text-brand-dark leading-[0.95] font-display mb-4 text-balance">
              {profile.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-4 gap-x-8 mb-8">
              {profile.university && (
                <div className="flex items-center gap-2.5 text-brand-mid font-display font-medium text-xl md:text-2xl tracking-tight">
                  <Trophy size={20} className="opacity-50" />
                  {profile.university}
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-brand-dark/40 font-sans font-medium text-sm uppercase tracking-widest">
                  <MapPin size={16} className="text-brand-mid" />
                  {profile.location}
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 text-brand-dark/40 font-sans font-medium text-sm uppercase tracking-widest">
                  <Phone size={16} className="text-brand-mid" />
                  {profile.phone}
                </div>
              )}
            </div>

            <p className="text-brand-dark/70 text-lg md:text-xl leading-relaxed max-w-2xl mb-12 font-light text-balance mx-auto lg:mx-0">
              {profile.bio || "Talented student ready to help your UMKM grow through high-quality freelance work."}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={handleDownload}
                className="h-14 px-8 rounded-full bg-brand-mid text-white font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-brand-mid/90 transition-all shadow-lg shadow-brand-mid/20 hover:-translate-y-0.5 cursor-pointer"
              >
                <Download size={18} /> Download Portfolio
              </button>
              <button 
                onClick={handleChat}
                disabled={chatLoading}
                className="h-14 px-8 rounded-full bg-transparent border border-brand-dark/20 text-brand-dark font-semibold tracking-wide flex items-center justify-center hover:bg-brand-dark/5 transition-all cursor-pointer disabled:opacity-50"
              >
                {chatLoading ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} className="mr-2" />}
                Hubungi {profile.name.split(" ")[0]}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[420px] shrink-0 relative"
          >
            <div className="absolute inset-0 bg-brand-mid/20 rounded-[4rem] rotate-6 scale-105 opacity-50 blur-2xl" />
            <div className="relative rounded-[3.5rem] overflow-hidden bg-white aspect-square flex items-center justify-center shadow-ambient border border-brand-dark/5">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-mid flex items-center justify-center">
                  <span className="text-[140px] font-bold text-white/20 select-none font-display">
                    {profile.name[0]}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {[
            { label: "Tasks Completed", value: profile.completedTasks || 0, icon: null },
            { 
              label: "Client Rating", 
              value: (profile.hideRatings) ? "—" : (profile.avgRating ? profile.avgRating.toFixed(1) : "—"), 
              icon: (!profile.hideRatings) ? <Star className="text-brand-mid" fill="currentColor" size={24} /> : null 
            },
            { label: "BANTU Rank", value: rank, icon: null, highlight: true }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-[2.5rem] p-10 text-center shadow-ambient border border-brand-dark/5 flex flex-col items-center justify-center ${stat.highlight ? 'bg-brand-mid/5 border-brand-mid/10' : ''}`}
            >
              <div className={`text-5xl font-semibold tracking-tight font-display mb-2 flex items-center gap-2 ${stat.highlight ? 'text-brand-mid' : 'text-brand-dark'}`}>
                {stat.value}
                {stat.icon}
              </div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-brand-dark/40 uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-brand-dark/10" />
              <h3 className="text-xl font-semibold text-brand-dark font-display uppercase tracking-[0.2em]">Core Competencies</h3>
              <div className="h-px flex-1 bg-brand-dark/10" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {profile.skills.map(skill => (
                <div key={skill} className="flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-brand-dark/5 shadow-sm hover:border-brand-mid transition-colors cursor-default">
                  <span className="text-sm font-semibold text-brand-dark/80">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Ledger Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              Live Ledger — Proof of Action
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-brand-dark font-display mb-4">Verified Work History</h2>
            <p className="text-brand-dark/50 max-w-2xl mx-auto leading-relaxed font-light">
              Setiap entri dibuat secara otomatis dan diverifikasi oleh BANTU setelah disetujui oleh klien.
            </p>
          </div>

          {entries.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-24 text-center border border-brand-dark/5 shadow-ambient">
              <div className="w-20 h-20 bg-brand-dark/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-dark/20">
                <Loader2 size={40} className="animate-spin" />
              </div>
              <p className="text-brand-dark/40 font-medium">Belum ada riwayat kerja yang terverifikasi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {entries.map((entry, index) => (
                <motion.div 
                  key={entry.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-ambient border border-brand-dark/5 group cursor-pointer hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="aspect-[16/10] bg-brand-dark relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-mid/60 to-brand-dark transition-opacity group-hover:opacity-80" />
                    <span className="relative z-10 text-6xl">
                      {categoryIcon[entry.category] || "📁"}
                    </span>
                    {entry.verified && (
                      <div className="absolute top-5 right-5 z-10 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                        <CheckCircle2 size={12} className="text-green-400" />
                        <span className="text-[9px] text-white font-bold uppercase tracking-widest">Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-block bg-brand-mid/10 text-brand-mid text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {entry.category}
                      </span>
                      {entry.aiGrade && !profile.hideAiScores && (
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${gradeColor[entry.aiGrade] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                          {entry.aiGrade}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-brand-dark text-xl mb-3 font-display leading-tight">{entry.projectTitle}</h3>
                    
                    {entry.rating && !profile.hideRatings && (
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            size={12} 
                            className={s <= entry.rating! ? "text-yellow-400 fill-yellow-400" : "text-brand-dark/10"} 
                          />
                        ))}
                        {entry.review && <span className="text-[10px] text-brand-dark/40 ml-2 italic">"{entry.review}"</span>}
                      </div>
                    )}

                    <p className="text-sm text-brand-dark/60 leading-relaxed line-clamp-2 mb-6 font-light">{entry.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest pt-6 border-t border-brand-dark/5">
                      <span className="truncate max-w-[140px]">{entry.clientName ? `for ${entry.clientName}` : 'Private Client'}</span>
                      <span>{entry.completedAt?.toDate ? formatDistanceToNow(entry.completedAt.toDate(), { addSuffix: true }) : ""}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-mid rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-mid/30"
        >
          {/* Background Patterns */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:32px_32px]" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight font-display mb-6 text-balance leading-[1.05]">Siap untuk berkolaborasi?</h2>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light text-balance">
              Pekerjakan {profile.name.split(" ")[0]} untuk proyek UMKM Anda berikutnya. Semua pengerjaan dilindungi oleh sistem escrow kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/marketplace" className="h-16 px-10 bg-white text-brand-mid font-semibold rounded-full hover:bg-brand-light transition-all shadow-xl flex items-center gap-2 justify-center text-lg">
                Jelajahi Talent Lain <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ATS Friendly Printable Version (Only visible when printing) */}
      <div className="hidden print:block bg-white text-black font-serif w-full">
        <style dangerouslySetInnerHTML={{ __html: `
          @page { size: auto; margin: 0mm; }
          @media print {
            body { background: white !important; margin: 0 !important; }
            header, footer, nav { display: none !important; }
            .hidden.print\\:block { 
              display: block !important; 
              padding: 20mm 15mm !important;
            }
          }
        `}} />
        
        <div className="border-b-2 border-black pb-6 mb-8">
          <div className="text-4xl font-bold mb-2">{profile.name}</div>
          <div className="text-sm font-bold">
            {profile.university && <span>{profile.university}</span>}
            {profile.location && <span> • {profile.location}</span>}
            {profile.phone && <span> • {profile.phone}</span>}
            {profile.email && <span> • {profile.email}</span>}
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold uppercase border-b border-black mb-4">Professional Summary</h2>
          <p className="text-sm leading-relaxed italic">
            {profile.bio || "Talented student professional with a verified track record of delivering high-quality freelance projects for UMKM. Specialized in bridging technical execution with business needs."}
          </p>
        </section>

        {profile.skills && profile.skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold uppercase border-b border-black mb-4">Technical Skills</h2>
            <div className="text-sm">
              {profile.skills.join(", ")}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-bold uppercase border-b border-black mb-4">Verified Work History (Via BANTU Platform)</h2>
          <div className="space-y-8">
            {entries.map((entry) => (
              <div key={entry.id} className="page-break-inside-avoid">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-bold underline">{entry.projectTitle}</h3>
                  <span className="text-sm font-bold">
                    {entry.completedAt?.toDate ? new Date(entry.completedAt.toDate()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : ""}
                  </span>
                </div>
                <div className="flex gap-4 text-xs font-bold uppercase mb-2">
                  <span>Category: {entry.category}</span>
                  {entry.rating && !profile.hideRatings && (
                    <>
                      <span>•</span>
                      <span>Client Rating: {entry.rating}/5</span>
                    </>
                  )}
                </div>
                <p className="text-sm leading-relaxed mb-2">
                  {entry.description}
                </p>
                {entry.review && !profile.hideRatings && (
                  <div className="bg-gray-50 border-l-2 border-black p-3 text-xs italic">
                    " {entry.review} " — Client Feedback
                  </div>
                )}
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-sm italic text-gray-500 underline">No verified projects in ledger yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
