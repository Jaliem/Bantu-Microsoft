"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ClipboardList, Clock, CheckCircle2, AlertCircle, ExternalLink, Loader2, UploadCloud } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: string;
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  projectBudget: string;
  umkmName: string;
  status: "applied" | "accepted" | "in_progress" | "completed" | "rejected";
  appliedAt: any;
}

export default function MyTasksPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (userData?.role === "UMKM") {
      router.push("/dashboard/my-posts");
      return;
    }

    const fetchTasks = async () => {
      try {
        const q = query(
          collection(db, "applications"),
          where("studentId", "==", user.uid),
          orderBy("appliedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const taskList: Task[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          taskList.push({
            id: docSnap.id,
            projectId: data.projectId,
            projectTitle: data.projectTitle || "Untitled Project",
            projectCategory: data.projectCategory || "General",
            projectBudget: data.projectBudget || "N/A",
            umkmName: data.umkmName || "Unknown UMKM",
            status: data.status || "applied",
            appliedAt: data.appliedAt,
          });
        }

        if (taskList.length === 0) {
          const projectsQ = query(collection(db, "projects"));
          const projectsSnap = await getDocs(projectsQ);
          for (const pDoc of projectsSnap.docs) {
            const pData = pDoc.data();
            if (pData.applicants && pData.applicants.includes(user.uid)) {
              let umkmName = "Unknown UMKM";
              if (pData.umkmId) {
                try {
                  const umkmDoc = await getDoc(doc(db, "users", pData.umkmId));
                  if (umkmDoc.exists()) umkmName = umkmDoc.data().name || "Unknown UMKM";
                } catch (e) {}
              }
              taskList.push({
                id: pDoc.id,
                projectId: pDoc.id,
                projectTitle: pData.title || "Untitled Project",
                projectCategory: pData.category || "General",
                projectBudget: pData.budget || "N/A",
                umkmName,
                status: pData.acceptedStudent === user.uid ? "accepted" : "applied",
                appliedAt: pData.createdAt,
              });
            }
          }
        }

        setTasks(taskList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, userData, router]);

  const filteredTasks = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    applied: { label: "Applied", color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: <Clock size={12} /> },
    accepted: { label: "Accepted", color: "text-brand-mid", bg: "bg-brand-mid/10 border-brand-mid/20", icon: <CheckCircle2 size={12} /> },
    in_progress: { label: "In Progress", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100", icon: <Loader2 size={12} className="animate-spin" /> },
    completed: { label: "Completed", color: "text-brand-mid", bg: "bg-brand-mid/10 border-brand-mid/20", icon: <CheckCircle2 size={12} /> },
    rejected: { label: "Rejected", color: "text-red-500", bg: "bg-red-50 border-red-100", icon: <AlertCircle size={12} /> },
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
                {tab.key === "all" ? tasks.length : tasks.filter(t => t.status === tab.key).length}
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
            <h3 className="text-2xl font-display font-bold text-brand-dark mb-3">Belum ada tugas</h3>
            <p className="text-brand-dark/40 mb-10 font-sans font-light">Mulai telusuri marketplace dan lamar proyek pertama Anda.</p>
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
                const status = statusConfig[task.status] || statusConfig.applied;
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
                          <span className={`text-[9px] uppercase font-bold tracking-[0.15em] px-3 py-1.5 rounded-full border flex items-center gap-2 ${status.bg} ${status.color.replace('text-', 'border-')}/10 ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-display font-bold text-brand-dark mb-2 group-hover:text-brand-mid transition-colors">{task.projectTitle}</h3>
                        <p className="text-[11px] font-bold text-brand-dark/30 uppercase tracking-widest flex items-center gap-3">
                          By <span className="text-brand-dark/60">{task.umkmName}</span>
                          {task.appliedAt && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-brand-dark/10" />
                              <span>Applied {formatDistanceToNow(task.appliedAt?.toDate ? task.appliedAt.toDate() : new Date(task.appliedAt), { addSuffix: true })}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="text-left md:text-right">
                          <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-brand-dark/20 mb-1">Budget</p>
                          <p className="font-display font-bold text-brand-dark">{task.projectBudget}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {(task.status === "accepted" || task.status === "in_progress") && (
                            <Link
                              href={`/submit-work/${task.id}`}
                              className="flex items-center gap-3 bg-brand-mid text-white text-[10px] font-display font-bold uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand-mid/20"
                            >
                              <UploadCloud size={14} />
                              {task.status === "in_progress" ? "View Submission" : "Submit Work"}
                            </Link>
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
    </div>
  );
}
