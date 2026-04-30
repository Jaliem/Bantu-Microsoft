"use client";

import React, { useEffect, useState, useRef } from "react";
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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
    const isImage = fileUrl && (fileUrl.toLowerCase().endsWith('.jpg') || fileUrl.toLowerCase().endsWith('.jpeg') || fileUrl.toLowerCase().endsWith('.png') || fileUrl.toLowerCase().endsWith('.webp'));

    try {
      const res = await fetch("/api/review-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionText,
          projectTitle: project?.title,
          projectDescription: project?.description,
          category: project?.category,
          fileUrl: isImage ? fileUrl : null,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.zip', '.jpg', '.jpeg', '.png', '.webp'];
    const isImage = file.type.startsWith('image/');
    const isZip = file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';

    if (!isZip && !isImage) {
      toast.error("Format file harus .zip atau gambar (jpg, png, webp)");
      return;
    }

    if (file.size > 1024 * 1024 * 1024) {
      toast.error("Ukuran file melebihi 1GB. Silakan upload ke Google Drive dan cantumkan URL-nya di deskripsi.", { duration: 6000 });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingFile(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "submissions");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFileUrl(data.url);
        setFileName(file.name);
        toast.success(`${isImage ? 'Gambar' : 'File .zip'} berhasil diunggah!`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah file. Coba lagi atau gunakan Google Drive.");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      toast.error("Deskripsi submisi tidak boleh kosong.");
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
        fileUrl: fileUrl || null,
        fileName: fileName || null,
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
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark pt-28 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard/my-tasks" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 hover:text-brand-mid transition-all mb-6 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Tugas Saya
        </Link>

        {/* Header */}
        <div className="mb-7">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-display font-bold tracking-tight text-brand-dark mb-2"
          >
            {project?.title}
          </motion.h1>
          <p className="text-brand-dark/40 text-base font-sans font-light flex flex-wrap items-center gap-3">
            <span>by {application?.umkmName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/10 hidden md:block" />
            <span>{project?.category}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/10 hidden md:block" />
            <span className="text-brand-dark/60 font-bold">{project?.budget}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Form */}
          <div className="flex-1">
            {/* Submission Form */}
            <div className="bg-white rounded-[2rem] p-8 shadow-ambient border border-brand-dark/5">
              <h2 className="text-xl font-display font-bold text-brand-dark mb-7">Submisi Anda</h2>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">
                    File Hasil Pekerjaan (ZIP atau Gambar)
                  </label>
                  <input type="file" accept=".zip,application/zip,application/x-zip-compressed,image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  
                  {fileUrl ? (
                    <div className="flex items-center justify-between bg-brand-mid/10 border border-brand-mid/20 rounded-[1.25rem] px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-brand-mid" />
                        <div>
                          <p className="text-sm font-bold text-brand-dark truncate max-w-[200px]">{fileName}</p>
                          <p className="text-xs text-brand-dark/50">File berhasil diunggah</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setFileUrl(null); setFileName(null); }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="w-full flex flex-col items-center justify-center gap-3 bg-brand-light/50 border border-dashed border-brand-dark/20 rounded-[1.25rem] p-8 text-brand-dark/50 hover:bg-white hover:border-brand-mid/40 transition-all"
                    >
                      {uploadingFile ? (
                        <>
                          <Loader2 size={24} className="animate-spin text-brand-mid" />
                          <span className="text-sm">Mengunggah file...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={28} className="text-brand-dark/30" />
                          <div className="text-center">
                            <span className="text-sm font-bold text-brand-dark block">Klik untuk upload ZIP atau Gambar</span>
                            <span className="text-xs mt-1 block">Maksimal ukuran 1GB. Jika lebih, silakan cantumkan link GDrive di deskripsi.</span>
                          </div>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">
                    Deskripsi Pekerjaan & Deliverables <span className="text-brand-mid">*</span>
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => { setSubmissionText(e.target.value); setAiReview(null); }}
                    placeholder="Jelaskan apa yang telah Anda kerjakan, bagaimana ini memenuhi SOP, dan cantumkan semua deliverables dengan jelas (misal: tautan Google Drive, link desain, dll)."
                    rows={9}
                    className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-[1.25rem] px-6 py-5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all resize-none leading-relaxed font-sans"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">Catatan Pengiriman (Opsional)</label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Catatan tambahan untuk klien, misal: revisi maksimal 2x, file siap diunduh di tautan di atas."
                    rows={2}
                    className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-[1.25rem] px-6 py-5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all resize-none font-sans"
                  />
                </div>
              </div>

              <div className="mt-8 pt-7 border-t border-brand-dark/5 flex flex-col sm:flex-row items-center justify-between gap-5">
                <p className="text-xs text-brand-dark/30 font-sans italic max-w-sm">
                  Gunakan AI Quality Check untuk memastikan submisi Anda sudah sesuai standar.
                </p>
                <button
                  onClick={handleAIReview}
                  disabled={reviewing || !submissionText.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-brand-mid/10 text-brand-mid hover:bg-brand-mid hover:text-white font-display font-bold px-8 py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-[10px] uppercase tracking-widest border border-brand-mid/20"
                >
                  {reviewing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {reviewing ? "AI sedang meninjau..." : "Jalankan AI Quality Check"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Result, AI Info, and Final Submit */}
          <div className="w-full lg:w-[360px] shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* AI Review Result — compact card in sidebar */}
            <AnimatePresence>
              {reviewing && !aiReview && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[2rem] p-7 border border-brand-dark/5 shadow-ambient flex items-center gap-4"
                >
                  <Loader2 size={18} className="animate-spin text-brand-mid shrink-0" />
                  <p className="text-sm text-brand-dark/50 font-sans">AI sedang menganalisis submisi Anda…</p>
                </motion.div>
              )}
              {aiReview && (
                <motion.div
                  key="ai-result"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-[2rem] border shadow-ambient overflow-hidden ${gradeBg[aiReview.grade] || "bg-white border-brand-dark/5"}`}
                >
                  {/* Score header */}
                  <div className="px-7 pt-7 pb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-brand-dark/20 mb-1">AI Gate Analysis</p>
                      <div className="flex items-end gap-3">
                        <span className={`text-5xl font-display font-black leading-none ${gradeColor[aiReview.grade] || "text-brand-dark"}`}>
                          {aiReview.grade}
                        </span>
                        <div className="mb-1">
                          <span className="text-xl font-display font-bold text-brand-dark/40">{aiReview.score}</span>
                          <span className="text-xs font-bold text-brand-dark/20">/100</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {aiReview.approved ? (
                        <div className="inline-flex items-center gap-1.5 bg-brand-mid text-white px-3.5 py-2 rounded-full font-display font-bold text-[9px] uppercase tracking-widest shadow-md shadow-brand-mid/20">
                          <CheckCircle2 size={12} /> Approved
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-red-500 text-white px-3.5 py-2 rounded-full font-display font-bold text-[9px] uppercase tracking-widest shadow-md shadow-red-500/20">
                          <XCircle size={12} /> Revision
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="px-7 pb-5">
                    <p className="text-xs text-brand-dark/60 leading-relaxed font-sans italic border-t border-brand-dark/5 pt-4">
                      "{aiReview.feedback}"
                    </p>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-2 gap-0 border-t border-brand-dark/5">
                    <div className="px-5 py-5 border-r border-brand-dark/5">
                      <p className="text-[8px] font-bold text-brand-dark/20 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                        <Star size={10} className="text-brand-mid fill-brand-mid" /> Strengths
                      </p>
                      <ul className="space-y-2">
                        {aiReview.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-brand-dark/55 font-sans leading-snug">
                            <CheckCircle2 size={10} className="text-brand-mid shrink-0 mt-0.5" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="px-5 py-5">
                      <p className="text-[8px] font-bold text-brand-dark/20 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                        <TrendingUp size={10} className="text-orange-500" /> Improve
                      </p>
                      <ul className="space-y-2">
                        {aiReview.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-brand-dark/55 font-sans leading-snug">
                            <AlertCircle size={10} className="text-orange-400 shrink-0 mt-0.5" /> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {!aiReview.approved && (
                    <div className="mx-5 mb-5 mt-1 bg-red-50/80 border border-red-100 rounded-xl p-4 text-center">
                      <p className="text-[11px] text-red-600 font-sans font-medium leading-snug">
                        AI menyarankan beberapa perbaikan untuk hasil maksimal.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Info Card */}
            <div className="bg-brand-dark rounded-[1.75rem] p-6 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-52 h-52 bg-brand-mid/20 rounded-full blur-[70px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-base mb-1.5">AI Quality Analysis</h3>
                  <p className="text-white/50 text-[11px] leading-relaxed font-sans font-light">
                    Skor minimal 60 (Grade B) disarankan untuk memastikan kualitas terbaik bagi UMKM.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm shrink-0 text-right">
                  <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest mb-0.5">Target</p>
                  <p className="text-xl font-display font-black text-brand-mid">60<span className="text-white/20 text-xs ml-0.5">/100</span></p>
                </div>
              </div>
            </div>

            {/* Final Submit Card */}
            <div className="bg-white rounded-[1.75rem] p-6 border border-brand-dark/5 shadow-ambient">
              <div className="mb-5">
                <h4 className="font-display font-bold text-sm text-brand-dark mb-1">Escrow Protected</h4>
                <p className="text-[11px] text-brand-dark/40 leading-relaxed font-sans font-light">
                  Dana akan segera dicairkan ke wallet Anda setelah UMKM menyetujui submisi ini.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !submissionText.trim()}
                className="w-full flex items-center justify-center gap-3 bg-brand-dark hover:bg-brand-mid text-white font-display font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-brand-dark/10 hover:-translate-y-1 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 cursor-pointer text-[11px] uppercase tracking-widest"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? "Mengirim..." : "Kirim ke Klien"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
