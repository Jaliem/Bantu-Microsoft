"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  UploadCloud,
  Edit3,
  DollarSign,
  X,
  Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { serverTimestamp } from "firebase/firestore";

interface Task {
  id: string;
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  projectBudget: string;
  bidAmount?: string;
  umkmId: string;
  umkmName: string;
  status: "applied" | "accepted" | "in_progress" | "completed" | "rejected";
  appliedAt: any;
  umkmRating?: number;
  umkmReview?: string;
}

export default function MyTasksPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // Edit Bid State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newBid, setNewBid] = useState("");
  const [updating, setUpdating] = useState(false);

  // Rating State
  const [ratingTask, setRatingTask] = useState<Task | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!authLoading && userData?.role === "UMKM") {
      router.push("/dashboard/my-posts");
      return;
    }

    const fetchTasks = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "applications"),
          where("studentId", "==", user.uid),
          orderBy("appliedAt", "desc"),
        );
        const snapshot = await getDocs(q);
        const taskList: Task[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          taskList.push({
            id: docSnap.id, // This is the application ID
            projectId: data.projectId,
            projectTitle: data.projectTitle || "Untitled Project",
            projectCategory: data.projectCategory || "General",
            projectBudget: data.bidAmount || data.projectBudget || "N/A",
            bidAmount: data.bidAmount,
            umkmId: data.umkmId,
            umkmName: data.umkmName || "Unknown UMKM",
            status: data.status || "applied",
            appliedAt: data.appliedAt,
            umkmRating: data.umkmRating,
            umkmReview: data.umkmReview,
          });
        }

        setTasks(taskList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Fallback if index is not ready or other error
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, userData, router]);

  const handleUpdateBid = async () => {
    if (!editingTask || !newBid) return;
    setUpdating(true);
    try {
      const formattedBid = `Rp ${parseInt(newBid).toLocaleString("id-ID")}`;
      await updateDoc(doc(db, "applications", editingTask.id), {
        bidAmount: formattedBid,
        projectBudget: formattedBid,
      });

      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, bidAmount: formattedBid, projectBudget: formattedBid }
            : t,
        ),
      );

      toast.success("Bid updated successfully!");
      setEditingTask(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update bid.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRateUMKM = async () => {
    if (!ratingTask || !user) return;
    setRatingLoading(true);
    try {
      // 1. Update Application document
      await updateDoc(doc(db, "applications", ratingTask.id), {
        umkmRating: rating,
        umkmReview: review,
        umkmRatedAt: serverTimestamp(),
      });

      // 2. Update UMKM user document
      const umkmRef = doc(db, "users", ratingTask.umkmId);
      const umkmSnap = await getDoc(umkmRef);

      if (umkmSnap.exists()) {
        const umkmData = umkmSnap.data();
        const currentAvgRating = umkmData.avgRating || 0;
        const currentRatingCount = umkmData.ratingCount || 0;
        const newRatingCount = currentRatingCount + 1;
        const newAvgRating =
          (currentAvgRating * currentRatingCount + rating) / newRatingCount;

        await updateDoc(umkmRef, {
          avgRating: newAvgRating,
          ratingCount: newRatingCount,
        });
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === ratingTask.id
            ? { ...t, umkmRating: rating, umkmReview: review }
            : t,
        ),
      );

      toast.success("Terima kasih atas penilaian Anda!");
      setRatingTask(null);
      setRating(5);
      setReview("");
    } catch (error) {
      console.error("Error rating UMKM:", error);
      toast.error("Gagal mengirim penilaian.");
    } finally {
      setRatingLoading(false);
    }
  };

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string; icon: React.ReactNode }
  > = {
    applied: {
      label: "Applied",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
      icon: <Clock size={12} />,
    },
    accepted: {
      label: "Accepted",
      color: "text-brand-mid",
      bg: "bg-brand-mid/10 border-brand-mid/20",
      icon: <CheckCircle2 size={12} />,
    },
    in_progress: {
      label: "In Progress",
      color: "text-yellow-600",
      bg: "bg-yellow-50 border-yellow-100",
      icon: <Loader2 size={12} className="animate-spin" />,
    },
    completed: {
      label: "Completed",
      color: "text-brand-mid",
      bg: "bg-brand-mid/10 border-brand-mid/20",
      icon: <CheckCircle2 size={12} />,
    },
    rejected: {
      label: "Rejected",
      color: "text-red-500",
      bg: "bg-red-50 border-red-100",
      icon: <AlertCircle size={12} />,
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-light items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark pt-28 pb-20 px-6">
      <main className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight text-brand-dark"
          >
            My Tasks
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-dark/40 mt-2 text-lg font-sans font-light"
          >
            Pantau status lamaran dan proyek aktif Anda.
          </motion.p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-3 mb-10 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "applied", label: "Applied" },
            { key: "accepted", label: "Accepted" },
            { key: "in_progress", label: "In Progress" },
            { key: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                filter === tab.key
                  ? "bg-brand-dark text-white shadow-xl shadow-brand-dark/10"
                  : "bg-white text-brand-dark/40 border border-brand-dark/5 hover:border-brand-mid/30 hover:text-brand-mid shadow-ambient"
              }`}
            >
              {tab.label}
              <span className="ml-2 opacity-40">
                {tab.key === "all"
                  ? tasks.length
                  : tasks.filter((t) => t.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-20 text-center border border-brand-dark/5 shadow-ambient"
          >
            <div className="w-24 h-24 bg-brand-light flex items-center justify-center rounded-[2rem] mx-auto mb-8 border border-brand-dark/5">
              <ClipboardList className="text-brand-dark/10" size={40} />
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-dark mb-3">
              Belum ada tugas
            </h3>
            <p className="text-brand-dark/40 mb-10 font-sans font-light">
              Mulai telusuri marketplace dan lamar proyek pertama Anda.
            </p>
            <Link
              href="/marketplace"
              className="bg-brand-dark text-white font-display font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-brand-mid transition-all shadow-xl shadow-brand-dark/10"
            >
              Cari Proyek
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTasks.map((task, idx) => {
                const status =
                  statusConfig[task.status] || statusConfig.applied;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[2rem] p-8 md:p-10 border border-brand-dark/5 shadow-ambient hover:border-brand-mid/30 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-brand-mid bg-brand-mid/10 px-3 py-1.5 rounded-full border border-brand-mid/10">
                            {task.projectCategory}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold tracking-[0.15em] px-3 py-1.5 rounded-full border flex items-center gap-2 ${status.bg} ${status.color.replace("text-", "border-")}/10 ${status.color}`}
                          >
                            {status.icon} {status.label}
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-display font-bold text-brand-dark mb-2 group-hover:text-brand-mid transition-colors">
                          {task.projectTitle}
                        </h3>
                        <p className="text-[11px] font-bold text-brand-dark/30 uppercase tracking-widest flex items-center gap-3">
                          By{" "}
                          <span className="text-brand-dark/60">
                            {task.umkmName}
                          </span>
                          {task.appliedAt ? (
                            <>
                              <span className="w-1 h-1 rounded-full bg-brand-dark/10" />
                              <span>
                                Applied{" "}
                                {formatDistanceToNow(
                                  task.appliedAt?.toDate
                                    ? task.appliedAt.toDate()
                                    : new Date(task.appliedAt),
                                  { addSuffix: true },
                                )}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="w-1 h-1 rounded-full bg-brand-dark/10" />
                              <span>Applied just now</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="text-left md:text-right">
                          <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-brand-dark/20 mb-1">
                            Budget
                          </p>
                          <p className="font-display font-bold text-brand-dark">
                            {task.projectBudget}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {task.status === "applied" && (
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setNewBid(
                                  task.bidAmount?.replace(/[^0-9]/g, "") || "",
                                );
                              }}
                              className="w-14 h-14 bg-brand-mid/10 rounded-2xl flex items-center justify-center text-brand-mid hover:bg-brand-mid hover:text-white transition-all shadow-sm cursor-pointer"
                              title="Edit Bid"
                            >
                              <Edit3 size={20} />
                            </button>
                          )}
                          {(task.status === "accepted" ||
                            task.status === "in_progress") && (
                            <Link
                              href={`/submit-work/${task.id}`}
                              className="flex items-center gap-3 bg-brand-mid text-white text-[10px] font-display font-bold uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand-mid/20"
                            >
                              <UploadCloud size={14} />
                              {task.status === "in_progress"
                                ? "View Submission"
                                : "Submit Work"}
                            </Link>
                          )}
                          {task.status === "completed" && !task.umkmRating && (
                            <button
                              onClick={() => setRatingTask(task)}
                              className="flex items-center gap-3 bg-yellow-400 text-white text-[10px] font-display font-bold uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-400/20 cursor-pointer"
                            >
                              <Star size={14} fill="white" />
                              Rate UMKM
                            </button>
                          )}
                          {task.status === "completed" && task.umkmRating && (
                            <div className="flex items-center gap-2 bg-brand-mid/5 text-brand-mid text-[9px] font-bold uppercase tracking-widest px-4 py-3 rounded-2xl border border-brand-mid/10">
                              <Star size={12} fill="currentColor" />
                              Rated {task.umkmRating}/5
                            </div>
                          )}
                          <Link
                            href={`/marketplace/${task.projectId}`}
                            className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center text-brand-dark/20 hover:bg-brand-dark hover:text-white transition-all shadow-sm"
                          >
                            <ExternalLink size={20} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Edit Bid Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTask(null)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl border border-brand-dark/5"
            >
              <button
                onClick={() => setEditingTask(null)}
                className="absolute top-8 right-8 text-brand-dark/20 hover:text-brand-dark transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-brand-mid/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-brand-mid">
                  <DollarSign size={40} />
                </div>
                <h3 className="text-3xl font-display font-bold text-brand-dark mb-2">
                  Update Bid
                </h3>
                <p className="text-brand-dark/40 font-sans font-light">
                  Sesuaikan penawaran Anda untuk proyek ini.
                </p>
                <p className="text-[10px] text-brand-dark/30 font-bold uppercase tracking-widest mt-1">
                  (Biaya platform 2% akan dikenakan saat selesai)
                </p>
                <p className="text-brand-mid font-display font-bold text-sm mt-2">
                  {editingTask.projectTitle}
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] ml-1">
                    Penawaran Baru (Rp)
                  </label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-dark/20 font-display font-black text-xl group-focus-within:text-brand-mid transition-colors">
                      Rp
                    </div>
                    <input
                      type="text"
                      value={newBid}
                      onChange={(e) =>
                        setNewBid(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      placeholder="500.000"
                      className="w-full bg-brand-light/50 border-2 border-transparent rounded-2xl pl-16 pr-8 py-6 text-brand-dark placeholder:text-brand-dark/20 focus:bg-white focus:border-brand-mid focus:ring-4 focus:ring-brand-mid/5 transition-all outline-none font-display font-black text-2xl tracking-tighter"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setEditingTask(null)}
                    className="flex-1 py-4 font-display font-bold text-[10px] uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdateBid}
                    disabled={updating || !newBid}
                    className="flex-[2] bg-brand-mid text-white font-display font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand-mid/20 hover:bg-brand-dark transition-all disabled:opacity-50 active:scale-95"
                  >
                    {updating ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Memperbarui...
                      </div>
                    ) : (
                      "Update Penawaran"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRatingTask(null)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl border border-brand-dark/5"
            >
              <button
                onClick={() => setRatingTask(null)}
                className="absolute top-8 right-8 text-brand-dark/20 hover:text-brand-dark transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-yellow-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-yellow-500">
                  <Star size={40} fill="currentColor" />
                </div>
                <h3 className="text-3xl font-display font-bold text-brand-dark mb-2">
                  Beri Penilaian UMKM
                </h3>
                <p className="text-brand-dark/40 font-sans font-light">
                  Bagaimana pengalaman Anda bekerja sama dengan{" "}
                  {ratingTask.umkmName}?
                </p>
              </div>

              <div className="space-y-8">
                {/* Star Rating */}
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <Star
                        size={44}
                        className={
                          s <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-brand-dark/10"
                        }
                      />
                    </button>
                  ))}
                </div>

                {/* Review Textarea */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] ml-1">
                    Ulasan Singkat (Opsional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Respon cepat, instruksi sangat jelas, sangat membantu..."
                    className="w-full bg-brand-light/50 border-none rounded-2xl p-5 text-sm text-brand-dark font-sans min-h-[120px] focus:ring-2 focus:ring-brand-mid/20 transition-all placeholder:text-brand-dark/20 outline-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setRatingTask(null)}
                    className="flex-1 py-4 font-display font-bold text-[10px] uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleRateUMKM}
                    disabled={ratingLoading}
                    className="flex-[2] bg-brand-mid text-white font-display font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand-mid/20 hover:bg-brand-dark transition-all disabled:opacity-50"
                  >
                    {ratingLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Mengirim...
                      </div>
                    ) : (
                      "Kirim Penilaian"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
