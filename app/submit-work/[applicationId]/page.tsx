"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";
import {
  ChevronLeft, CheckCircle2, AlertCircle, Loader2,
  UploadCloud, Send, ShieldCheck, Star, TrendingUp, XCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIReview {
  score: number;
  grade: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  approved: boolean;
}

export default function SubmitWorkPage() {
  const { applicationId } = useParams() as { applicationId: string };
  const { user, userData } = useAuth();
  const router = useRouter();

  const [application, setApplication] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [reviewing, setReviewing] = useState(false);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (userData?.role === "UMKM") { router.push("/dashboard"); return; }

    const fetchData = async () => {
      try {
        const appDoc = await getDoc(doc(db, "applications", applicationId));
        if (appDoc.exists()) {
          const appData = { id: appDoc.id, ...appDoc.data() };
          setApplication(appData);

          const projDoc = await getDoc(doc(db, "projects", (appData as any).projectId));
          if (projDoc.exists()) setProject({ id: projDoc.id, ...projDoc.data() });

          const subQ = query(
            collection(db, "submissions"),
            where("applicationId", "==", applicationId),
            where("studentId", "==", user.uid)
          );
          const subSnap = await getDocs(subQ);
          if (!subSnap.empty) setAlreadySubmitted(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [applicationId, user, userData, router]);

  const handleAIReview = async () => {
    if (!submissionText.trim()) {
      toast.error("Silakan deskripsikan pekerjaan Anda sebelum meminta tinjauan AI.");
      return;
    }
    setReviewing(true);
    setAiReview(null);
    try {
      const res = await fetch("/api/review-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionText,
          projectTitle: project?.title,
          projectDescription: project?.description,
          category: project?.category,
        }),
      });
      const data = await res.json();
      setAiReview(data);
    } catch {
      toast.error("Tinjauan AI gagal. Anda masih dapat mengirim secara manual.");
    } finally {
      setReviewing(false);
    }
  };

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      toast.error("Deskripsi submisi tidak boleh kosong.");
      return;
    }
    if (aiReview && !aiReview.approved) {
      toast.error("Mohon perbaiki berdasarkan masukan AI sebelum mengirim ke klien.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "submissions"), {
        applicationId,
        projectId: application?.projectId,
        studentId: user!.uid,
        studentName: userData?.name,
        submissionText,
        deliveryNotes,
        aiScore: aiReview?.score ?? null,
        aiGrade: aiReview?.grade ?? null,
        aiFeedback: aiReview?.feedback ?? null,
        status: "pending",
        submittedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "applications", applicationId), {
        status: "in_progress",
        submittedAt: serverTimestamp(),
      });

      if (application?.projectId) {
        await updateDoc(doc(db, "projects", application.projectId), {
          hasSubmission: true,
        });
      }

      toast.success("Pekerjaan berhasil dikirim! Menunggu tinjauan klien.");
      router.push("/dashboard/my-tasks");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const gradeColor: Record<string, string> = {
    S: "text-brand-mid", A: "text-brand-mid", B: "text-blue-600",
    C: "text-orange-600", D: "text-red-600",
  };
  const gradeBg: Record<string, string> = {
    S: "bg-brand-mid/5 border-brand-mid/10", A: "bg-brand-mid/5 border-brand-mid/10",
    B: "bg-blue-50 border-blue-100", C: "bg-orange-50 border-orange-100",
    D: "bg-red-50 border-red-100",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-2xl font-display font-bold text-brand-dark">Tugas tidak ditemukan</h1>
        <Link href="/dashboard/my-tasks" className="text-brand-mid font-display font-bold uppercase tracking-widest text-xs">Kembali ke Tugas Saya</Link>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center gap-8 px-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-ambient border border-brand-dark/5"
        >
          <CheckCircle2 size={40} className="text-brand-mid" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-dark mb-3">Pekerjaan Sudah Dikirim</h1>
          <p className="text-brand-dark/40 max-w-md mx-auto font-sans">
            Anda telah mengirimkan pekerjaan untuk tugas ini. Menunggu tinjauan dari klien.
          </p>
        </div>
        <Link href="/dashboard/my-tasks" className="bg-brand-dark text-white font-display font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-brand-mid transition-all shadow-xl shadow-brand-dark/10">
          Kembali ke Tugas Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard/my-tasks" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 hover:text-brand-mid transition-all mb-10 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Tugas Saya
        </Link>

        {/* Header */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight text-brand-dark mb-4"
          >
            {project?.title}
          </motion.h1>
          <p className="text-brand-dark/40 text-lg font-sans font-light flex flex-wrap items-center gap-4">
            <span>by {application?.umkmName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/10 hidden md:block" />
            <span>{project?.category}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/10 hidden md:block" />
            <span className="text-brand-dark/60 font-bold">{project?.budget}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Form and Results */}
          <div className="flex-1 space-y-8">
            {/* Submission Form */}
            <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-ambient border border-brand-dark/5">
              <h2 className="text-2xl font-display font-bold text-brand-dark mb-10">Submisi Anda</h2>

              <div className="grid grid-cols-1 gap-10">
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">
                    Deskripsi Pekerjaan & Deliverables <span className="text-brand-mid">*</span>
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => { setSubmissionText(e.target.value); setAiReview(null); }}
                    placeholder="Jelaskan apa yang telah Anda kerjakan, bagaimana ini memenuhi SOP, dan cantumkan semua deliverables dengan jelas (misal: tautan Google Drive, link desain, dll)."
                    rows={12}
                    className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-[1.5rem] px-8 py-6 text-base text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all resize-none leading-relaxed font-sans"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">Catatan Pengiriman (Opsional)</label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Catatan tambahan untuk klien, misal: revisi maksimal 2x, file siap diunduh di tautan di atas."
                    rows={3}
                    className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-[1.5rem] px-8 py-6 text-base text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all resize-none font-sans"
                  />
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-brand-dark/5 flex flex-col sm:flex-row items-center justify-between gap-8">
                <p className="text-xs text-brand-dark/30 font-sans italic max-w-sm">
                  Gunakan AI Quality Check untuk memastikan submisi Anda sudah sesuai standar.
                </p>
                <button
                  onClick={handleAIReview}
                  disabled={reviewing || !submissionText.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-brand-mid/10 text-brand-mid hover:bg-brand-mid hover:text-white font-display font-bold px-10 py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-[10px] uppercase tracking-widest border border-brand-mid/20"
                >
                  {reviewing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {reviewing ? "AI sedang meninjau..." : "Jalankan AI Quality Check"}
                </button>
              </div>
            </div>

            {/* AI Review Result (Inline) */}
            <AnimatePresence>
              {aiReview && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-[2.5rem] p-10 md:p-12 border shadow-ambient ${gradeBg[aiReview.grade] || "bg-white border-brand-dark/5"}`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-dark/20 mb-6">AI Gate Analysis</p>
                      <div className="flex items-end gap-6 mb-8">
                        <span className={`text-8xl font-display font-black leading-none ${gradeColor[aiReview.grade] || "text-brand-dark"}`}>
                          {aiReview.grade}
                        </span>
                        <div className="mb-2">
                          <span className="text-3xl font-display font-bold text-brand-dark/40">{aiReview.score}</span>
                          <span className="text-base font-bold text-brand-dark/20">/100</span>
                        </div>
                      </div>
                      <div className="mb-8">
                        {aiReview.approved ? (
                          <div className="inline-flex items-center gap-2 bg-brand-mid text-white px-5 py-2.5 rounded-full font-display font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-mid/20">
                            <CheckCircle2 size={16} /> Approved to Send
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-full font-display font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20">
                            <XCircle size={16} /> Needs Revision
                          </div>
                        )}
                      </div>
                      <p className="text-lg text-brand-dark/70 leading-relaxed font-sans font-light italic">"{aiReview.feedback}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
                      <div>
                        <p className="text-[9px] font-bold text-brand-dark/20 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <Star size={14} className="text-brand-mid fill-brand-mid" /> Strengths
                        </p>
                        <ul className="space-y-4">
                          {aiReview.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-4 text-sm text-brand-dark/60 font-sans leading-relaxed">
                              <CheckCircle2 size={14} className="text-brand-mid shrink-0 mt-0.5" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-brand-dark/20 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <TrendingUp size={14} className="text-orange-500" /> Improvements
                        </p>
                        <ul className="space-y-4">
                          {aiReview.improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-4 text-sm text-brand-dark/60 font-sans leading-relaxed">
                              <AlertCircle size={14} className="text-orange-400 shrink-0 mt-0.5" /> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {!aiReview.approved && (
                    <div className="bg-red-50/50 border border-red-100 rounded-2xl p-8 text-center">
                      <p className="text-sm text-red-600 font-sans font-medium">
                        Mohon perbaiki pekerjaan Anda berdasarkan masukan auditor AI di atas agar dapat dikirim ke klien.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: AI Info and Final Submit */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-8">
            {/* AI Info Card */}
            <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-mid/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="font-display font-bold text-xl">AI Quality Gate</h3>
                </div>
                <p className="text-white/60 text-sm leading-relaxed font-sans font-light mb-8">
                  Auditor AI kami memastikan hasil kerja Anda memenuhi standar sebelum diterima oleh UMKM. Skor minimal 60 (Grade B) diperlukan.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-1">Target Score</p>
                  <p className="text-3xl font-display font-black text-brand-mid">60<span className="text-white/20 text-sm ml-1">/100</span></p>
                </div>
              </div>
            </div>

            {/* Final Submit Card */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-brand-dark/5 shadow-ambient">
              <div className="flex items-start gap-4 mb-8">
                <div>
                  <h4 className="font-display font-bold text-sm text-brand-dark mb-1">Escrow Protected</h4>
                  <p className="text-[11px] text-brand-dark/40 leading-relaxed font-sans font-light">
                    Dana akan segera dicairkan ke wallet Anda setelah UMKM menyetujui submisi ini.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !submissionText.trim() || (aiReview !== null && !aiReview.approved)}
                className="w-full flex items-center justify-center gap-4 bg-brand-dark hover:bg-brand-mid text-white font-display font-bold py-6 px-8 rounded-2xl transition-all shadow-xl shadow-brand-dark/10 hover:-translate-y-1 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 cursor-pointer text-[11px] uppercase tracking-widest"
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                {submitting ? "Mengirim..." : !aiReview ? "Kirim Tanpa AI" : aiReview.approved ? "Kirim ke Klien" : "Revisi Dulu"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
