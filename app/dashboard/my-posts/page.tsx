"use client";

import React, { useEffect, useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

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

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  status: "applied" | "accepted" | "rejected";
  appliedAt: any;
  bidAmount?: string;
}

interface Project {
  id: string;
  title: string;
  category: string;
  budget: string;
  status: string;
  createdAt: any;
  submissions: Submission[];
  applications: Application[];
  applicantCount: number;
  expanded: boolean;
}

export default function MyPostsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<{project: Project, submission: Submission} | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!authLoading && userData?.role !== "UMKM") { router.push("/dashboard/my-tasks"); return; }

    const fetchProjects = async () => {
      if (!user) return;
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

          const subQ = query(
            collection(db, "submissions"),
            where("projectId", "==", projDoc.id)
          );
          const subSnap = await getDocs(subQ);
          const submissions: Submission[] = subSnap.docs.map(s => ({
            id: s.id,
            ...s.data(),
          } as Submission));

          const appQ = query(
            collection(db, "applications"),
            where("projectId", "==", projDoc.id)
          );
          const appSnap = await getDocs(appQ);
          const applications: Application[] = appSnap.docs.map(a => ({
            id: a.id,
            ...a.data(),
          } as Application));

          projectList.push({
            id: projDoc.id,
            title: projData.title,
            category: projData.category,
            budget: projData.budget,
            status: projData.status || "open",
            createdAt: projData.createdAt,
            submissions,
            applications,
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

  const handleAcceptApplicant = async (project: Project, application: Application) => {
    setAcceptingId(application.id);
    try {
      // 1. Update project status, accepted student and budget
      await updateDoc(doc(db, "projects", project.id), {
        status: "in_progress",
        acceptedStudent: application.studentId,
        acceptedApplicationId: application.id,
        budget: application.bidAmount || project.budget
      });

      // 2. Update application status
      await updateDoc(doc(db, "applications", application.id), {
        status: "accepted"
      });

      // 3. Reject other applications (optional but cleaner)
      const otherApps = project.applications.filter(a => a.id !== application.id);
      for (const other of otherApps) {
        await updateDoc(doc(db, "applications", other.id), {
          status: "rejected"
        });
      }

      toast.success(`Accepted ${application.studentName}! Project is now in progress.`);
      
      setProjects(prev => prev.map(p => 
        p.id === project.id 
          ? { 
              ...p, 
              status: "in_progress",
              applications: p.applications.map(a => 
                a.id === application.id ? { ...a, status: "accepted" } : { ...a, status: "rejected" }
              )
            } 
          : p
      ));
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept applicant.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleApprove = async () => {
    if (!selectedSub) return;
    const { project, submission } = selectedSub;
    
    setApprovingId(submission.id);
    try {
      await updateDoc(doc(db, "submissions", submission.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "applications", submission.applicationId), {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "projects", project.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });

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
        rating: rating,
        review: review,
        completedAt: serverTimestamp(),
        verified: true,
      });

      const studentRef = doc(db, "users", submission.studentId);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        
        const currentAvgRating = studentData.avgRating || 0;
        const currentRatingCount = studentData.ratingCount || 0;
        const newRatingCount = currentRatingCount + 1;
        const newAvgRating = (currentAvgRating * currentRatingCount + rating) / newRatingCount;

        const newCompleted = (studentData.completedTasks || 0) + 1;
        const newRank = computeRank(newCompleted, newAvgRating);
        
        await updateDoc(studentRef, {
          completedTasks: newCompleted,
          rank: newRank,
          avgRating: newAvgRating,
          ratingCount: newRatingCount
        });
      }

      const budgetNum = parseBudget(project.budget);
      const platformFee = Math.floor(budgetNum * 0.02);
      const netAmount = budgetNum - platformFee;

      await addDoc(collection(db, "transactions"), {
        userId: submission.studentId,
        projectId: project.id,
        projectTitle: project.title,
        amount: netAmount,
        type: "credit",
        description: `Payment for: ${project.title} (Net after 2% fee)`,
        status: "completed",
        createdAt: serverTimestamp(),
      });

      toast.success(`Work approved! Payment released for ${submission.studentName}.`);
      setShowRatingModal(false);
      setSelectedSub(null);

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
      toast.error("Failed to approve.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (submission: Submission) => {
    try {
      await updateDoc(doc(db, "submissions", submission.id), { status: "rejected" });
      await updateDoc(doc(db, "applications", submission.applicationId), { status: "accepted" });
      toast.success("Submission rejected.");
      setProjects(prev => prev.map(p => ({
        ...p,
        submissions: p.submissions.map(s =>
          s.id === submission.id ? { ...s, status: "rejected" } : s
        ),
      })));
    } catch {
      toast.error("Failed to reject.");
    }
  };

  const gradeColor: Record<string, string> = {
    S: "text-brand-mid bg-brand-mid/10", A: "text-brand-mid bg-brand-mid/5",
    B: "text-blue-600 bg-blue-50", C: "text-orange-600 bg-orange-50",
    D: "text-red-600 bg-red-50",
  };

  const projectStatusConfig: Record<string, { label: string; color: string }> = {
    open: { label: "Open", color: "bg-blue-50 text-blue-600" },
    in_progress: { label: "In Progress", color: "bg-yellow-50 text-yellow-600" },
    completed: { label: "Completed", color: "bg-brand-mid/10 text-brand-mid" },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-light items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark pt-28 pb-20 px-6">
      <main className="max-w-5xl mx-auto w-full">
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight text-brand-dark"
          >
            My Posts
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-dark/40 mt-2 text-lg font-sans font-light"
          >
            Tinjau hasil kerja mahasiswa dan selesaikan pembayaran.
          </motion.p>
        </div>

        {projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-20 text-center border border-brand-dark/5 shadow-ambient"
          >
            <div className="w-24 h-24 bg-brand-light flex items-center justify-center rounded-[2rem] mx-auto mb-8 border border-brand-dark/5">
              <ClipboardList className="text-brand-dark/10" size={40} />
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-dark mb-3">Belum ada proyek</h3>
            <p className="text-brand-dark/40 mb-10 font-sans font-light">Posting proyek pertama Anda untuk mulai mencari talenta.</p>
            <Link href="/post-project" className="bg-brand-dark text-white font-display font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-brand-mid transition-all shadow-xl shadow-brand-dark/10">
              Posting Proyek
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {projects.map((project, idx) => {
                const statusCfg = projectStatusConfig[project.status] || projectStatusConfig.open;
                const pendingSubmissions = project.submissions.filter(s => s.status === "pending");
                return (
                  <motion.div 
                    key={project.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-ambient overflow-hidden"
                  >
                    {/* Project Header */}
                    <div
                      className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-brand-light/30 transition-all group"
                      onClick={() => toggleExpand(project.id)}
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-brand-mid bg-brand-mid/10 px-3 py-1.5 rounded-full border border-brand-mid/10">
                            {project.category}
                          </span>
                          <span className={`text-[9px] uppercase font-bold tracking-[0.15em] px-3 py-1.5 rounded-full border border-current/10 ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                          {pendingSubmissions.length > 0 && (
                            <span className="text-[9px] uppercase font-bold tracking-[0.15em] px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-2">
                              <Sparkles size={10} /> {pendingSubmissions.length} Tinjauan Baru
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl md:text-2xl font-display font-bold text-brand-dark mb-2 group-hover:text-brand-mid transition-colors">{project.title}</h3>
                        <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-brand-dark/30 uppercase tracking-widest">
                          <span className="flex items-center gap-2 text-brand-dark/60"><Users size={14} className="text-brand-dark/20" /> {project.applicantCount} Applicants</span>
                          <span className="w-1 h-1 rounded-full bg-brand-dark/10" />
                          <span className="text-brand-dark/60 font-black tracking-normal text-sm">{project.budget}</span>
                          <span className="w-1 h-1 rounded-full bg-brand-dark/10" />
                          <span>{project.createdAt ? formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true }) : 'Baru saja'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/marketplace/${project.id}`}
                          onClick={e => e.stopPropagation()}
                          className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center text-brand-dark/20 hover:bg-brand-dark hover:text-white transition-all shadow-sm"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center text-brand-dark/20 transition-all">
                          {project.expanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Panel */}
                    <AnimatePresence>
                      {project.expanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-brand-dark/5 bg-brand-light/20 p-8 md:p-10"
                        >
                          {/* Applicants List (Show if project is open) */}
                          {project.status === "open" && (
                            <div className="space-y-6 mb-10">
                              <h4 className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-[0.2em] mb-6">
                                Applicants ({project.applications.length})
                              </h4>
                              {project.applications.length === 0 ? (
                                <p className="text-sm text-brand-dark/30 font-sans italic">Belum ada pelamar.</p>
                              ) : (
                                <div className="grid grid-cols-1 gap-4">
                                  {project.applications.map((app) => (
                                    <div key={app.id} className="bg-white rounded-2xl p-6 border border-brand-dark/5 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-white font-display font-bold">
                                          {app.studentName?.[0]}
                                        </div>
                                        <div>
                                          <p className="font-display font-bold text-brand-dark text-sm">{app.studentName}</p>
                                          <div className="flex flex-wrap items-center gap-3">
                                            <p className="text-[9px] text-brand-dark/30 uppercase tracking-widest">
                                              Applied {app.appliedAt?.toDate ? formatDistanceToNow(app.appliedAt.toDate(), { addSuffix: true }) : "Baru saja"}
                                            </p>
                                            {app.bidAmount && (
                                              <>
                                                <span className="w-1 h-1 rounded-full bg-brand-dark/10" />
                                                <p className="text-[9px] text-brand-mid font-black uppercase tracking-widest">Bid: {app.bidAmount}</p>
                                              </>
                                            )}
                                            <Link 
                                              href={`/portfolio/${app.studentId}`}
                                              className="text-[9px] text-brand-mid font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
                                            >
                                              Lihat Portofolio <ExternalLink size={10} />
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleAcceptApplicant(project, app)}
                                        disabled={acceptingId === app.id}
                                        className="bg-brand-mid text-white px-6 py-2.5 rounded-xl text-[10px] font-display font-bold uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand-mid/10 cursor-pointer disabled:opacity-50"
                                      >
                                        {acceptingId === app.id ? "Accepting..." : "Accept Student"}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Submissions List (Show if project is in_progress or completed) */}
                          {(project.status === "in_progress" || project.status === "completed") && (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-[0.2em]">
                                  {project.status === "completed" ? "Project Result" : "Work in Progress"}
                                </h4>
                                {project.status === "in_progress" && (
                                  <p className="text-[10px] font-bold text-brand-mid uppercase tracking-widest bg-brand-mid/10 px-3 py-1 rounded-full">
                                    Accepted Student: {project.applications.find(a => a.status === "accepted")?.studentName || "N/A"}
                                  </p>
                                )}
                              </div>
                              {project.submissions.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-[2rem] border border-brand-dark/5 shadow-sm">
                                  <Loader2 className="mx-auto mb-4 text-brand-dark/10 animate-spin" size={32} />
                                  <p className="text-brand-dark/30 font-display font-bold uppercase tracking-widest text-xs">Menunggu submisi dari mahasiswa...</p>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {project.submissions.map((sub) => (
                                    <div key={sub.id} className={`rounded-[2rem] border p-8 md:p-10 transition-all ${sub.status === "approved" ? "border-brand-mid/20 bg-white shadow-ambient" : sub.status === "rejected" ? "border-red-100 bg-red-50/20 opacity-70" : "border-brand-dark/5 bg-white shadow-sm"}`}>
                                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                        <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-brand-dark flex items-center justify-center text-white font-display font-bold text-lg shadow-lg">
                                            {sub.studentName?.[0] || "S"}
                                          </div>
                                          <div>
                                            <p className="font-display font-bold text-brand-dark text-lg">{sub.studentName}</p>
                                            <p className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest">
                                              {sub.submittedAt?.toDate ? formatDistanceToNow(sub.submittedAt.toDate(), { addSuffix: true }) : "Baru saja"}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                          {sub.aiGrade && (
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border ${gradeColor[sub.aiGrade] || "bg-brand-light text-brand-dark/60 border-brand-dark/5"}`}>
                                              <Sparkles size={12} /> AI Grade: {sub.aiGrade} ({sub.aiScore}/100)
                                            </div>
                                          )}
                                          {sub.status === "approved" && (
                                            <span className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-mid text-white shadow-lg shadow-brand-mid/20">
                                              <CheckCircle2 size={12} /> Approved
                                            </span>
                                          )}
                                          {sub.status === "rejected" && (
                                            <span className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-600">
                                              <XCircle size={12} /> Rejected
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="bg-brand-light/50 rounded-[1.5rem] p-6 mb-6">
                                        <p className="text-sm text-brand-dark/70 font-sans leading-relaxed whitespace-pre-wrap">{sub.submissionText}</p>
                                      </div>

                                      {sub.deliveryNotes && (
                                        <div className="bg-blue-50/50 rounded-2xl px-6 py-4 mb-6 border border-blue-100/50">
                                          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-2">Delivery Notes</p>
                                          <p className="text-sm text-brand-dark/60 font-sans">{sub.deliveryNotes}</p>
                                        </div>
                                      )}

                                      {sub.aiFeedback && (
                                        <div className="bg-brand-mid/5 rounded-2xl px-6 py-4 mb-8 border border-brand-mid/10">
                                          <p className="text-[9px] font-bold text-brand-mid uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Sparkles size={12} /> AI Quality Gate Feedback
                                          </p>
                                          <p className="text-sm text-brand-dark/60 font-sans leading-relaxed">{sub.aiFeedback}</p>
                                        </div>
                                      )}

                                      {sub.status === "pending" && project.status !== "completed" && (
                                        <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-8 border-t border-brand-dark/5">
                                          <button
                                            onClick={() => {
                                              setSelectedSub({ project, submission: sub });
                                              setShowRatingModal(true);
                                              setRating(5);
                                              setReview("");
                                            }}
                                            className="flex-1 flex items-center justify-center gap-3 bg-brand-mid hover:bg-brand-dark text-white font-display font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand-mid/20 cursor-pointer text-[10px] uppercase tracking-widest"
                                          >
                                            <CheckCircle2 size={16} />
                                            Approve & Release Payment
                                          </button>
                                          <button
                                            onClick={() => handleReject(sub)}
                                            className="px-10 flex items-center justify-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 font-display font-bold py-4 rounded-2xl transition-all cursor-pointer text-[10px] uppercase tracking-widest"
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRatingModal(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl border border-brand-dark/5"
            >
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-brand-mid/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-brand-mid">
                  <Star size={40} fill="currentColor" />
                </div>
                <h3 className="text-3xl font-display font-bold text-brand-dark mb-2">Beri Penilaian</h3>
                <p className="text-brand-dark/40 font-sans font-light">Bagaimana kualitas kerja dari {selectedSub?.submission.studentName}?</p>
              </div>

              <div className="space-y-8">
                {/* Star Rating */}
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        size={44} 
                        className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-brand-dark/10"} 
                      />
                    </button>
                  ))}
                </div>

                {/* Review Textarea */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] ml-1">Ulasan Singkat (Opsional)</label>
                  <textarea 
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Sangat profesional, hasil kerja melebihi ekspektasi..."
                    className="w-full bg-brand-light/50 border-none rounded-2xl p-5 text-sm text-brand-dark font-sans min-h-[120px] focus:ring-2 focus:ring-brand-mid/20 transition-all placeholder:text-brand-dark/20"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 py-4 font-display font-bold text-[10px] uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleApprove}
                    disabled={approvingId !== null}
                    className="flex-[2] bg-brand-mid text-white font-display font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand-mid/20 hover:bg-brand-dark transition-all disabled:opacity-50"
                  >
                    {approvingId ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Memproses...
                      </div>
                    ) : "Selesaikan & Beri Rating"}
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
