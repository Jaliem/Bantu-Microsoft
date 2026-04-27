"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection, query, where, getDocs, doc, getDoc,
  updateDoc, addDoc, serverTimestamp, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ClipboardList, ChevronDown, ChevronUp, CheckCircle2,
  Loader2, Star, Sparkles, Users, Trophy, ExternalLink, XCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Submission {
  id: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  submissionText: string;
  deliveryNotes?: string;
  aiScore: number | null;
  aiGrade: string | null;
  aiFeedback: string | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: any;
}

interface Project {
  id: string;
  title: string;
  category: string;
  budget: string;
  status: string;
  createdAt: any;
  submissions: Submission[];
  applicantCount: number;
  expanded: boolean;
}

export default function MyPostsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (userData?.role !== "UMKM") { router.push("/dashboard/my-tasks"); return; }

    const fetchProjects = async () => {
      try {
        const projQ = query(
          collection(db, "projects"),
          where("umkmId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const projSnap = await getDocs(projQ);

        const projectList: Project[] = [];

        for (const projDoc of projSnap.docs) {
          const projData = projDoc.data();

          // Fetch submissions for this project
          const subQ = query(
            collection(db, "submissions"),
            where("projectId", "==", projDoc.id)
          );
          const subSnap = await getDocs(subQ);
          const submissions: Submission[] = subSnap.docs.map(s => ({
            id: s.id,
            ...s.data(),
          } as Submission));

          // Count applicants
          const appQ = query(
            collection(db, "applications"),
            where("projectId", "==", projDoc.id)
          );
          const appSnap = await getDocs(appQ);

          projectList.push({
            id: projDoc.id,
            title: projData.title,
            category: projData.category,
            budget: projData.budget,
            status: projData.status || "open",
            createdAt: projData.createdAt,
            submissions,
            applicantCount: appSnap.size,
            expanded: false,
          });
        }

        setProjects(projectList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, userData, router]);

  const toggleExpand = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p));
  };

  const handleApprove = async (project: Project, submission: Submission) => {
    setApprovingId(submission.id);
    try {
      // Mark submission approved
      await updateDoc(doc(db, "submissions", submission.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
      });

      // Mark application completed
      await updateDoc(doc(db, "applications", submission.applicationId), {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      // Mark project completed
      await updateDoc(doc(db, "projects", project.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      // Auto-generate Live Ledger entry (Proof-of-Action) for student
      await addDoc(collection(db, "portfolioEntries"), {
        userId: submission.studentId,
        projectId: project.id,
        projectTitle: project.title,
        category: project.category,
        budget: project.budget,
        clientName: userData?.name,
        description: submission.submissionText.slice(0, 300),
        aiScore: submission.aiScore,
        aiGrade: submission.aiGrade,
        completedAt: serverTimestamp(),
        verified: true,
      });

      // Update student stats (completedTasks + rank)
      const studentRef = doc(db, "users", submission.studentId);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        const newCompleted = (studentData.completedTasks || 0) + 1;
        const newRank = computeRank(newCompleted, studentData.avgRating || 0);
        await updateDoc(studentRef, {
          completedTasks: newCompleted,
          rank: newRank,
        });
      }

      // Add transaction record for student earnings
      const budgetNum = parseBudget(project.budget);
      await addDoc(collection(db, "transactions"), {
        userId: submission.studentId,
        projectId: project.id,
        projectTitle: project.title,
        amount: budgetNum,
        type: "credit",
        description: `Payment for: ${project.title}`,
        status: "completed",
        createdAt: serverTimestamp(),
      });

      toast.success(`Work approved! Payment released and portfolio entry created for ${submission.studentName}.`);

      // Update local state
      setProjects(prev => prev.map(p =>
        p.id === project.id
          ? {
              ...p,
              status: "completed",
              submissions: p.submissions.map(s =>
                s.id === submission.id ? { ...s, status: "approved" } : { ...s, status: "rejected" }
              ),
            }
          : p
      ));
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (submission: Submission) => {
    try {
      await updateDoc(doc(db, "submissions", submission.id), { status: "rejected" });
      await updateDoc(doc(db, "applications", submission.applicationId), { status: "accepted" });
      toast.success("Submission rejected. Student can revise and resubmit.");
      setProjects(prev => prev.map(p => ({
        ...p,
        submissions: p.submissions.map(s =>
          s.id === submission.id ? { ...s, status: "rejected" } : s
        ),
      })));
    } catch {
      toast.error("Failed to reject submission.");
    }
  };

  const gradeColor: Record<string, string> = {
    S: "text-yellow-600 bg-yellow-50", A: "text-green-600 bg-green-50",
    B: "text-blue-600 bg-blue-50", C: "text-orange-600 bg-orange-50",
    D: "text-red-600 bg-red-50",
  };

  const projectStatusConfig: Record<string, { label: string; color: string }> = {
    open: { label: "Open", color: "bg-blue-50 text-blue-600" },
    in_progress: { label: "In Progress", color: "bg-yellow-50 text-yellow-600" },
    completed: { label: "Completed", color: "bg-green-50 text-green-700" },
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#faf8ff] font-sans">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#008f4c] border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#faf8ff] font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 lg:p-12 max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl md:text-[3rem] font-medium text-gray-900 font-display tracking-tight leading-tight">
              My Posts
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-light">
              Review submissions and approve work to release payment.
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-[#f8f9fe] text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No projects posted yet</h3>
              <p className="text-gray-500 mb-6">Post your first project to start finding talented students.</p>
              <Link href="/post-project" className="inline-flex items-center gap-2 bg-[#008f4c] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#007a41] transition-all cursor-pointer">
                Post a Project
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const statusCfg = projectStatusConfig[project.status] || projectStatusConfig.open;
                const pendingSubmissions = project.submissions.filter(s => s.status === "pending");
                return (
                  <div key={project.id} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(19,27,46,0.02)] overflow-hidden">
                    {/* Project Header */}
                    <div
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => toggleExpand(project.id)}
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#008f4c] bg-[#e6f4ea] px-3 py-1 rounded-full">
                            {project.category}
                          </span>
                          <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                          {pendingSubmissions.length > 0 && (
                            <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-orange-50 text-orange-600 flex items-center gap-1">
                              <Trophy size={10} /> {pendingSubmissions.length} Pending Review
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Users size={12} /> {project.applicantCount} applicants</span>
                          <span>·</span>
                          <span className="font-semibold text-gray-700">{project.budget}</span>
                          {project.createdAt && (
                            <><span>·</span>
                            <span>{formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true })}</span></>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/marketplace/${project.id}`}
                          onClick={e => e.stopPropagation()}
                          className="w-10 h-10 bg-[#f8f9fe] rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#008f4c] hover:text-white transition-all"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <div className="w-10 h-10 bg-[#f8f9fe] rounded-xl flex items-center justify-center text-gray-400">
                          {project.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>

                    {/* Submissions Panel */}
                    {project.expanded && (
                      <div className="border-t border-gray-100 p-6">
                        {project.submissions.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-400 text-sm">No submissions yet. Students are working on it!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">
                              Submissions ({project.submissions.length})
                            </h4>
                            {project.submissions.map((sub) => (
                              <div key={sub.id} className={`rounded-[20px] border p-6 ${sub.status === "approved" ? "border-green-200 bg-green-50/40" : sub.status === "rejected" ? "border-red-100 bg-red-50/20 opacity-60" : "border-gray-200 bg-white"}`}>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                  <div>
                                    <div className="flex items-center gap-3 mb-1">
                                      <div className="w-9 h-9 rounded-full bg-[#111827] flex items-center justify-center text-white font-bold text-sm">
                                        {sub.studentName?.[0] || "S"}
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-900 text-sm">{sub.studentName}</p>
                                        <p className="text-xs text-gray-400">
                                          {sub.submittedAt?.toDate ? formatDistanceToNow(sub.submittedAt.toDate(), { addSuffix: true }) : "Just now"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {sub.aiGrade && (
                                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${gradeColor[sub.aiGrade] || "bg-gray-50 text-gray-600"}`}>
                                        <Sparkles size={10} /> AI Grade: {sub.aiGrade} ({sub.aiScore}/100)
                                      </div>
                                    )}
                                    {sub.status === "approved" && (
                                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                        <CheckCircle2 size={10} /> Approved
                                      </span>
                                    )}
                                    {sub.status === "rejected" && (
                                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                                        <XCircle size={10} /> Rejected
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sub.submissionText}</p>
                                </div>

                                {sub.deliveryNotes && (
                                  <div className="bg-blue-50 rounded-xl px-4 py-3 mb-4">
                                    <p className="text-xs font-bold text-blue-600 mb-1">Delivery Notes</p>
                                    <p className="text-sm text-gray-600">{sub.deliveryNotes}</p>
                                  </div>
                                )}

                                {sub.aiFeedback && (
                                  <div className="bg-[#f0f2ff] rounded-xl px-4 py-3 mb-4">
                                    <p className="text-xs font-bold text-[#006d38] mb-1 flex items-center gap-1">
                                      <Sparkles size={10} /> AI Quality Gate Feedback
                                    </p>
                                    <p className="text-sm text-gray-600">{sub.aiFeedback}</p>
                                  </div>
                                )}

                                {sub.status === "pending" && project.status !== "completed" && (
                                  <div className="flex gap-3 mt-2">
                                    <button
                                      onClick={() => handleApprove(project, sub)}
                                      disabled={approvingId === sub.id}
                                      className="flex-1 flex items-center justify-center gap-2 bg-[#008f4c] hover:bg-[#007a41] text-white font-bold py-3 rounded-2xl transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                                    >
                                      {approvingId === sub.id
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <CheckCircle2 size={16} />}
                                      Approve & Release Payment
                                    </button>
                                    <button
                                      onClick={() => handleReject(sub)}
                                      className="px-6 flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-2xl transition-all cursor-pointer"
                                    >
                                      <XCircle size={16} /> Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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

function computeRank(completedTasks: number, avgRating: number): string {
  if (completedTasks >= 30 && avgRating >= 4.8) return "S";
  if (completedTasks >= 15) return "A";
  if (completedTasks >= 5) return "B";
  if (completedTasks >= 1) return "C";
  return "D";
}

function parseBudget(budget: string): number {
  const match = budget.replace(/\./g, "").match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}
