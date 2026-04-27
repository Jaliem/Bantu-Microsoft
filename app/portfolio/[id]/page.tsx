"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle2, Download, ArrowRight, Star, Sparkles, Loader2, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PortfolioEntry {
  id: string;
  projectTitle: string;
  category: string;
  budget: string;
  clientName?: string;
  description: string;
  aiScore?: number;
  aiGrade?: string;
  completedAt: any;
  verified: boolean;
}

interface StudentProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  university?: string;
  bio?: string;
  skills?: string[];
  rank?: string;
  completedTasks?: number;
  avgRating?: number;
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
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);

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
        const entryList: PortfolioEntry[] = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as PortfolioEntry));
        setEntries(entryList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPortfolio();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#008f4c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio not found</h1>
        <Link href="/marketplace" className="text-[#008f4c] font-bold">Go to Marketplace</Link>
      </div>
    );
  }

  const rankConfig: Record<string, { color: string; bg: string; label: string }> = {
    S: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Rank S — Elite Talent" },
    A: { color: "text-green-700", bg: "bg-green-100", label: "Rank A — Senior Talent" },
    B: { color: "text-blue-700", bg: "bg-blue-100", label: "Rank B — Skilled Talent" },
    C: { color: "text-orange-700", bg: "bg-orange-100", label: "Rank C — Rising Talent" },
    D: { color: "text-gray-600", bg: "bg-gray-100", label: "Rank D — New Talent" },
  };
  const rank = profile.rank || "D";
  const rankCfg = rankConfig[rank];

  return (
    <div className="bg-[#f8f9fe] flex flex-col font-sans text-gray-900 w-full h-full flex-1">
      <main className="flex-grow pt-24 pb-16 px-6 max-w-6xl mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 mb-16 relative">
          <div className="flex-1 z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#16a34a] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                <CheckCircle2 size={12} /> Verified Student Talent
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${rankCfg.color} ${rankCfg.bg}`}>
                <Trophy size={12} /> {rankCfg.label}
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#111827] leading-[1.1] mb-2">
              {profile.name}
            </h1>
            {profile.university && (
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#008f4c] leading-[1.1] mb-6">
                {profile.university}
              </h2>
            )}

            <p className="text-gray-600 text-lg leading-relaxed max-w-lg mb-8">
              {profile.bio || "Talented student ready to help your UMKM grow through high-quality freelance work."}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button className="bg-[#008f4c] hover:bg-[#007a41] text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer">
                <Download size={18} /> Download Portfolio PDF
              </button>
              <button className="bg-[#f0f2ff] text-[#006d38] font-bold py-3.5 px-8 rounded-full hover:bg-[#e4e7ff] transition-all cursor-pointer">
                Hire {profile.name.split(" ")[0]}
              </button>
            </div>
          </div>

          <div className="w-full md:w-[380px] shrink-0 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#e4e7ff] to-transparent rounded-[48px] rotate-3 scale-105 opacity-50" />
            <div className="relative rounded-[48px] overflow-hidden bg-gradient-to-br from-[#f0f2ff] to-[#e4e7ff] aspect-square flex items-center justify-center shadow-2xl border border-white/50">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[120px] font-black text-[#008f4c]/20 select-none">
                  {profile.name[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
            <div className="text-4xl font-black text-gray-900 mb-2">{profile.completedTasks || 0}</div>
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Tasks Completed</div>
          </div>
          <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
            <div className="text-4xl font-black text-gray-900 mb-2 flex items-center justify-center gap-2">
              {profile.avgRating ? profile.avgRating.toFixed(1) : "—"}
              <Star className="text-[#008f4c]" fill="currentColor" size={28} />
            </div>
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Client Rating</div>
          </div>
          <div className={`rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(19,27,46,0.03)] border ${rankCfg.bg} border-gray-100`}>
            <div className={`text-4xl font-black mb-2 ${rankCfg.color}`}>{rank}</div>
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">BANTU Rank</div>
          </div>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-0.5 w-8 bg-[#008f4c]" />
              <h3 className="text-xl font-bold text-gray-900">Core Competencies</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {profile.skills.map(skill => (
                <div key={skill} className="flex items-center gap-2 bg-[#f0f2ff] px-4 py-2.5 rounded-xl border border-white shadow-sm">
                  <span className="text-sm font-bold text-gray-700">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Ledger — Proof of Action */}
        <div className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#008f4c] to-[#00aa5b] text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                <Sparkles size={10} /> Live Ledger — Proof of Action
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Verified Work History</h2>
              <p className="text-gray-500 mt-1">Every entry is auto-generated and verified by BANTU upon client approval.</p>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100">
              <Loader2 className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400">No verified work yet. Complete tasks to build your ledger.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100 group cursor-pointer hover:-translate-y-1 transition-transform">
                  <div className="aspect-video bg-[#111827] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#006d38]/60 to-[#111827]" />
                    <span className="relative z-10 text-5xl">
                      {categoryIcon[entry.category] || "📁"}
                    </span>
                    {entry.verified && (
                      <div className="absolute top-3 right-3 z-10 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-green-400" />
                        <span className="text-[9px] text-white font-bold uppercase">Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block bg-[#e6f4ea] text-[#008f4c] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        {entry.category}
                      </span>
                      {entry.aiGrade && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border ${gradeColor[entry.aiGrade] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                          <Sparkles size={8} /> {entry.aiGrade}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{entry.projectTitle}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{entry.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{entry.clientName && `for ${entry.clientName}`}</span>
                      <span>{entry.completedAt?.toDate ? formatDistanceToNow(entry.completedAt.toDate(), { addSuffix: true }) : ""}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#00b050] to-[#008f4c] rounded-[40px] p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to start a project?</h2>
            <p className="text-white/90 text-lg max-w-xl mx-auto mb-10">
              Hire {profile.name.split(" ")[0]} for your next UMKM project. All work is escrow-protected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/marketplace" className="bg-white text-[#008f4c] font-bold py-4 px-8 rounded-full hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2 justify-center">
                Browse All Talent <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
