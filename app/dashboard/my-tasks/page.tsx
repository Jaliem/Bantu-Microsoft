"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ClipboardList, Clock, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

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
        // Fetch applications made by this student
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

        // If no applications collection exists yet, try fetching from projects
        if (taskList.length === 0) {
          const projectsQ = query(collection(db, "projects"));
          const projectsSnap = await getDocs(projectsQ);
          // Show projects the student has applied to (via applicants array)
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
    applied: { label: "Applied", color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: <Clock size={14} /> },
    accepted: { label: "Accepted", color: "text-green-600", bg: "bg-green-50 border-green-100", icon: <CheckCircle2 size={14} /> },
    in_progress: { label: "In Progress", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100", icon: <Loader2 size={14} className="animate-spin" /> },
    completed: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: <CheckCircle2 size={14} /> },
    rejected: { label: "Rejected", color: "text-red-500", bg: "bg-red-50 border-red-100", icon: <AlertCircle size={14} /> },
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#faf8ff] font-sans">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#008f4c] border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#faf8ff] font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 lg:p-12 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-[3rem] font-medium text-gray-900 font-display tracking-tight leading-tight">
              My Tasks
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-light">
              Track your job applications and ongoing projects.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
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
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                  filter === tab.key
                    ? "bg-[#008f4c] text-white shadow-md"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-[#008f4c] hover:text-[#008f4c]"
                }`}
              >
                {tab.label}
                {tab.key === "all" && ` (${tasks.length})`}
                {tab.key !== "all" && ` (${tasks.filter(t => t.status === tab.key).length})`}
              </button>
            ))}
          </div>

          {/* Task list */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-[#f8f9fe] text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-6">Start by browsing the marketplace and applying to projects.</p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 bg-[#008f4c] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#007a41] transition-all cursor-pointer"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const status = statusConfig[task.status] || statusConfig.applied;
                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(19,27,46,0.02)] hover:shadow-[0_8px_30px_rgba(19,27,46,0.05)] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#008f4c] bg-[#e6f4ea] px-3 py-1 rounded-full">
                            {task.projectCategory}
                          </span>
                          <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border flex items-center gap-1 ${status.color} ${status.bg}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{task.projectTitle}</h3>
                        <p className="text-sm text-gray-500">
                          By <span className="font-semibold text-gray-700">{task.umkmName}</span>
                          {task.appliedAt && (
                            <span className="ml-2">• Applied {formatDistanceToNow(task.appliedAt?.toDate ? task.appliedAt.toDate() : new Date(task.appliedAt), { addSuffix: true })}</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Budget</p>
                          <p className="text-sm font-bold text-gray-900">{task.projectBudget}</p>
                        </div>
                        <Link
                          href={`/marketplace/${task.projectId}`}
                          className="w-10 h-10 bg-[#f8f9fe] rounded-xl flex items-center justify-center text-gray-500 hover:bg-[#008f4c] hover:text-white transition-all cursor-pointer"
                        >
                          <ExternalLink size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
