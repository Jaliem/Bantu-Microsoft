"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const params = useParams();
  const uid = params.uid as string;
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already">("loading");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const verifyUser = async () => {
      if (!uid) {
        setStatus("error");
        return;
      }

      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setStatus("error");
          return;
        }

        const userData = userSnap.data();
        setUserName(userData.name || "User");

        if (userData.verified === true) {
          setStatus("already");
          return;
        }

        // Set verified to true
        await updateDoc(userRef, { verified: true });
        setStatus("success");
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
      }
    };

    verifyUser();
  }, [uid]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fe] to-[#e6f4ea] flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center p-6">

        {/* Brand */}
        <div className="text-center mb-8">
          <h2 className="text-[#008f4c] font-bold text-2xl tracking-tight">BANTU</h2>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">EMAIL VERIFICATION</p>
        </div>

        <div className="bg-white max-w-md w-full rounded-[32px] p-10 shadow-[0_8px_40px_rgba(19,27,46,0.06)] border border-gray-100 text-center">

          {status === "loading" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#008f4c] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Verifying your account...</h1>
              <p className="text-gray-500 text-sm">Please wait while we verify your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-24 h-24 bg-gradient-to-br from-[#e6f4ea] to-[#dcfce7] text-[#008f4c] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_4px_20px_rgba(0,143,76,0.1)]">
                <CheckCircle2 size={48} strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Email Verified! 🎉</h1>
              <p className="text-gray-500 mb-2 leading-relaxed text-sm">
                Welcome to BANTU, <span className="font-bold text-gray-900">{userName}</span>!
              </p>
              <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                Your account has been successfully verified. You can now log in and access all features of the BANTU platform.
              </p>
              <Link
                href="/login"
                className="w-full bg-[#008f4c] hover:bg-[#007a41] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Login <ArrowRight size={18} />
              </Link>
            </>
          )}

          {status === "already" && (
            <>
              <div className="w-24 h-24 bg-gradient-to-br from-[#e6f4ea] to-[#dcfce7] text-[#008f4c] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_4px_20px_rgba(0,143,76,0.1)]">
                <CheckCircle2 size={48} strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Already Verified ✅</h1>
              <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                Your account is already verified. You can go ahead and log in.
              </p>
              <Link
                href="/login"
                className="w-full bg-[#008f4c] hover:bg-[#007a41] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Login <ArrowRight size={18} />
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h1>
              <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                This verification link is invalid or has expired. Please try registering again or contact support.
              </p>
              <Link
                href="/register"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Back to Register
              </Link>
            </>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 mt-8 text-xs text-gray-400">
          <ShieldCheck size={14} /> Secured by BANTU Verification System
        </div>
      </main>
    </div>
  );
}
