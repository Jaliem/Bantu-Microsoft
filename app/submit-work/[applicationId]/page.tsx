"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";
import {
  ChevronLeft, Sparkles, CheckCircle2, AlertCircle, Loader2,
  UploadCloud, Send, ShieldCheck, Star, TrendingUp, XCircle
} from "lucide-react";

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
        // Try applications collection first
        const appDoc = await getDoc(doc(db, "applications", applicationId));
        if (appDoc.exists()) {
          const appData = { id: appDoc.id, ...appDoc.data() };
          setApplication(appData);

          const projDoc = await getDoc(doc(db, "projects", (appData as any).projectId));
          if (projDoc.exists()) setProject({ id: projDoc.id, ...projDoc.data() });

          // Check if already submitted
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
      toast.error("Please describe your work before requesting AI review.");
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
      toast.error("AI review failed. You can still submit manually.");
    } finally {
      setReviewing(false);
    }
  };

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      toast.error("Submission description cannot be empty.");
      return;
    }
    if (aiReview && !aiReview.approved) {
      toast.error("Please address the AI feedback and resubmit for review before sending to client.");
      return;
    }

    setSubmitting(true);
    try {
      // Create submission doc
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

      // Update application status to in_progress
      await updateDoc(doc(db, "applications", applicationId), {
        status: "in_progress",
        submittedAt: serverTimestamp(),
      });

      // Update project applicant status
      if (application?.projectId) {
        await updateDoc(doc(db, "projects", application.projectId), {
          hasSubmission: true,
        });
      }

      toast.success("Work submitted successfully! Awaiting client review.");
      router.push("/dashboard/my-tasks");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const gradeColor: Record<string, string> = {
    S: "text-yellow-500", A: "text-green-500", B: "text-blue-500",
    C: "text-orange-500", D: "text-red-500",
  };
  const gradeBg: Record<string, string> = {
    S: "bg-yellow-50 border-yellow-200", A: "bg-green-50 border-green-200",
    B: "bg-blue-50 border-blue-200", C: "bg-orange-50 border-orange-200",
    D: "bg-red-50 border-red-200",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#008f4c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Task not found</h1>
        <Link href="/dashboard/my-tasks" className="text-[#008f4c] font-bold">Back to My Tasks</Link>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-[#008f4c]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center">Work Already Submitted</h1>
        <p className="text-gray-500 text-center max-w-md">
          You've already submitted work for this task. Awaiting client review.
        </p>
        <Link href="/dashboard/my-tasks" className="bg-[#008f4c] text-white font-bold px-8 py-3 rounded-2xl hover:bg-[#007a41] transition-colors">
          Back to My Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fe] font-sans text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/dashboard/my-tasks" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#008f4c] transition-colors mb-8 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to My Tasks
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#e6f4ea] text-[#008f4c] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            <UploadCloud size={12} /> Submit Work
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">{project?.title}</h1>
          <p className="text-gray-500">by {application?.umkmName} · {project?.category} · {project?.budget}</p>
        </div>

        {/* AI Quality Gate banner */}
        <div className="bg-gradient-to-br from-[#00b050] to-[#008f4c] rounded-[24px] p-6 text-white mb-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">AI Quality Gate Active</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              Your work will be reviewed by our AI auditor before reaching the client. A score of 60+ (Grade B) is required to pass. This protects your reputation and ensures client satisfaction.
            </p>
          </div>
        </div>

        {/* Submission Form */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Submission</h2>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Work Description & Deliverables <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Describe what you've done, how it meets the SOP, and list all deliverables clearly. This is what the AI and client will review.</p>
            <textarea
              value={submissionText}
              onChange={(e) => { setSubmissionText(e.target.value); setAiReview(null); }}
              placeholder="e.g. I have completed the logo design for Warung Kopi Jaya. Deliverables include: (1) SVG logo file with 3 color variants, (2) PNG exports at 1x and 3x resolution, (3) Brand guide PDF covering typography (Plus Jakarta Sans), colors (#3d2c20, #d4a373), and logo usage rules..."
              rows={8}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008f4c] focus:border-transparent resize-none leading-relaxed"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Notes (Optional)</label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Any notes for the client, revision terms, file access links, etc."
              rows={3}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008f4c] focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleAIReview}
            disabled={reviewing || !submissionText.trim()}
            className="w-full flex items-center justify-center gap-3 bg-[#f0f2ff] text-[#006d38] hover:bg-[#e4e7ff] font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {reviewing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {reviewing ? "AI is reviewing your work…" : "Run AI Quality Check"}
          </button>
        </div>

        {/* AI Review Result */}
        {aiReview && (
          <div className={`rounded-[32px] p-8 border mb-6 ${gradeBg[aiReview.grade] || "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">AI Quality Gate Result</p>
                <div className="flex items-end gap-3">
                  <span className={`text-6xl font-black ${gradeColor[aiReview.grade] || "text-gray-700"}`}>
                    {aiReview.grade}
                  </span>
                  <span className="text-3xl font-black text-gray-400 mb-1">{aiReview.score}/100</span>
                </div>
              </div>
              <div className="text-right">
                {aiReview.approved ? (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                    <CheckCircle2 size={16} /> Approved to Send
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full font-bold text-sm">
                    <XCircle size={16} /> Needs Revision
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-6">{aiReview.feedback}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Star size={12} className="text-green-500" /> Strengths
                </p>
                <ul className="space-y-2">
                  {aiReview.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp size={12} className="text-orange-500" /> Improvements
                </p>
                <ul className="space-y-2">
                  {aiReview.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertCircle size={14} className="text-orange-400 shrink-0 mt-0.5" /> {imp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {!aiReview.approved && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm text-red-600 font-medium">
                  Your submission scored below 60. Please revise your work based on the feedback above, then run the AI check again before submitting to the client.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_24px_rgba(19,27,46,0.03)]">
          <div className="flex items-center gap-3 mb-5">
            <ShieldCheck size={20} className="text-[#008f4c]" />
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">BANTU Escrow Protection</span> — Payment will be released once the client approves your submission.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !submissionText.trim() || (aiReview !== null && !aiReview.approved)}
            className="w-full flex items-center justify-center gap-3 bg-[#008f4c] hover:bg-[#007a41] text-white font-bold py-4 rounded-2xl transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 cursor-pointer"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {submitting ? "Submitting…" : !aiReview ? "Submit Without AI Review" : aiReview.approved ? "Submit to Client" : "Fix Issues First"}
          </button>

          {!aiReview && (
            <p className="text-center text-xs text-gray-400 mt-3">
              We recommend running the AI Quality Check first to maximize your chances of approval.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
