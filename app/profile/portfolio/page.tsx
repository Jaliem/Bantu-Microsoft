"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Layout, FileText, CheckCircle2, Star, Sparkles, Loader2 } from "lucide-react";

interface PortfolioEntry {
  id: string;
  projectTitle: string;
  category: string;
  isHidden?: boolean;
  completedAt: any;
}

export default function CustomizePortfolioPage() {
  const { user, userData } = useAuth();
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Settings in userData
  const [hideAiScores, setHideAiScores] = useState(false);
  const [hideRatings, setHideRatings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (userData) {
      setHideAiScores(userData.hideAiScores || false);
      setHideRatings(userData.hideRatings || false);
    }
  }, [userData]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "portfolioEntries"),
          where("userId", "==", user.uid),
          orderBy("completedAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioEntry));
        setEntries(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [user]);

  const toggleVisibility = async (entryId: string, currentHidden: boolean) => {
    setUpdatingId(entryId);
    try {
      await updateDoc(doc(db, "portfolioEntries", entryId), {
        isHidden: !currentHidden
      });
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, isHidden: !currentHidden } : e));
      toast.success(currentHidden ? "Proyek sekarang ditampilkan" : "Proyek disembunyikan dari publik");
    } catch (err) {
      toast.error("Gagal memperbarui visibilitas");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    setSavingSettings(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        hideAiScores,
        hideRatings
      });
      toast.success("Pengaturan portofolio disimpan");
    } catch (err) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-mid" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Global Settings */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-ambient border border-brand-dark/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-brand-mid/10 rounded-2xl flex items-center justify-center text-brand-mid">
            <Layout size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-brand-dark tracking-tight">Pengaturan Tampilan</h2>
            <p className="text-brand-dark/40 text-sm">Pilih informasi apa yang ingin Anda tampilkan di portofolio publik.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center justify-between p-6 bg-brand-light/30 rounded-2xl border border-transparent hover:border-brand-mid/20 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-bold text-brand-dark">Sembunyikan Skor AI</p>
                <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mt-1">Grade S/A/B/C tetap tersembunyi</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={hideAiScores} 
              onChange={e => setHideAiScores(e.target.checked)}
              className="w-5 h-5 accent-brand-mid"
            />
          </label>

          <label className="flex items-center justify-between p-6 bg-brand-light/30 rounded-2xl border border-transparent hover:border-brand-mid/20 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-bold text-brand-dark">Sembunyikan Rating & Ulasan</p>
                <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mt-1">Ulasan klien tidak akan terlihat</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={hideRatings} 
              onChange={e => setHideRatings(e.target.checked)}
              className="w-5 h-5 accent-brand-mid"
            />
          </label>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="bg-brand-mid text-white font-display font-bold px-10 py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand-mid/20 disabled:opacity-70 flex items-center gap-3 text-[10px] uppercase tracking-widest cursor-pointer"
          >
            {savingSettings && <Loader2 size={14} className="animate-spin" />}
            Simpan Pengaturan
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-ambient border border-brand-dark/5">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-brand-dark/5 rounded-2xl flex items-center justify-center text-brand-dark/40">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-brand-dark tracking-tight">Kustomisasi Proyek</h2>
            <p className="text-brand-dark/40 text-sm">Pilih proyek spesifik yang ingin Anda sembunyikan atau tampilkan.</p>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 bg-brand-light/20 rounded-3xl border border-dashed border-brand-dark/10">
            <p className="text-brand-dark/30 font-display font-bold uppercase tracking-widest text-xs">Belum ada proyek dalam portofolio Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {entries.map((entry) => (
              <div 
                key={entry.id}
                className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${
                  entry.isHidden 
                    ? "bg-brand-light/20 border-brand-dark/5 opacity-60" 
                    : "bg-white border-brand-dark/5 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${entry.isHidden ? "bg-brand-dark/5 text-brand-dark/20" : "bg-brand-mid/10 text-brand-mid"}`}>
                    {entry.category === "Design" ? "🎨" : "📁"}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-brand-dark">{entry.projectTitle}</h4>
                    <p className="text-[10px] text-brand-dark/30 uppercase tracking-widest mt-1">
                      {entry.category} • {entry.completedAt?.toDate ? new Date(entry.completedAt.toDate()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : ""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleVisibility(entry.id, entry.isHidden || false)}
                  disabled={updatingId === entry.id}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    entry.isHidden
                      ? "bg-brand-dark text-white hover:bg-brand-mid"
                      : "bg-brand-light text-brand-dark/40 hover:text-brand-dark"
                  }`}
                >
                  {updatingId === entry.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : entry.isHidden ? (
                    <><Eye size={12} /> Tampilkan</>
                  ) : (
                    <><EyeOff size={12} /> Sembunyikan</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
