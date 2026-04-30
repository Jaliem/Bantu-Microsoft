"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user: currentUser, userData: currentUserData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUserData?.verified === true) {
      router.push("/dashboard");
    }
  }, [currentUser, currentUserData, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check Firestore verified field
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().verified !== true) {
        await firebaseSignOut(auth);
        toast.error("Please verify your email before logging in. Check your inbox for the verification link.");
        return;
      }
      
      // Set session cookie
      const maxAge = rememberMe ? 3 * 24 * 60 * 60 : 3 * 60 * 60;
      document.cookie = `bantu_session=true; path=/; max-age=${maxAge}; SameSite=Strict`;

      router.push("/dashboard");
      toast.success("Logged in successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // Check Firestore verified field
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().verified !== true) {
        await firebaseSignOut(auth);
        toast.error("Please verify your email before logging in. Check your inbox for the verification link.");
        return;
      }
      
      // Set session cookie
      const maxAge = rememberMe ? 3 * 24 * 60 * 60 : 3 * 60 * 60;
      document.cookie = `bantu_session=true; path=/; max-age=${maxAge}; SameSite=Strict`;

      router.push("/dashboard");
      toast.success("Successfully logged in!");
    } catch (err: any) {
      toast.error(err.message || "Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-y-auto pt-20 font-sans bg-white">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-brand-light p-16 relative overflow-hidden h-full">
        <div className="relative z-10 mt-12">
          <div className="max-w-md">
            <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] font-display font-semibold text-brand-dark leading-[1.1] mb-8 tracking-tight text-balance">
              Pemberdayaan UMKM Indonesia Melalui Digitalisasi.
            </h1>
            <p className="text-brand-dark/70 text-lg leading-relaxed font-sans font-light text-balance">
              Bergabunglah dengan ribuan pengusaha lokal untuk mengelola bisnis Anda dengan lebih cerdas dan efisien.
            </p>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-brand-mid/5 rounded-full blur-3xl" />
        
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col justify-center bg-white px-6 sm:px-12 lg:w-1/2 lg:px-24 relative h-full">
        <div className="w-full max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10 text-center lg:text-left"
          >
            <h2 className="text-4xl font-display font-semibold text-brand-dark tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-brand-dark/60 font-sans">Masuk ke akun BANTU Anda untuk melanjutkan.</p>
          </motion.div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 ml-1" htmlFor="email">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-[1.25rem] border-0 bg-brand-light/50 py-3.5 px-6 text-brand-dark placeholder:text-brand-dark/30 focus:ring-2 focus:ring-brand-mid transition-all font-sans outline-none"
                placeholder="nama@email.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" title="Lupa Password?" className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-mid hover:text-brand-dark transition-colors">
                  Lupa Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-[1.25rem] border-0 bg-brand-light/50 py-3.5 px-6 text-brand-dark placeholder:text-brand-dark/30 focus:ring-2 focus:ring-brand-mid transition-all font-sans outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center px-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-brand-dark/20 text-brand-mid focus:ring-brand-mid cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-3 block text-sm text-brand-dark/70 font-sans cursor-pointer">
                Biarkan saya tetap masuk
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-brand-mid py-4 font-display font-bold uppercase tracking-[0.2em] text-[0.7rem] text-white transition-all hover:bg-brand-dark active:scale-[0.98] shadow-xl shadow-brand-mid/20 disabled:opacity-70"
            >
              {loading ? "Loading..." : "Login ke Dashboard"}
            </button>
          </form>

          <div className="my-8 flex items-center before:flex-1 before:border-t before:border-brand-dark/5 after:flex-1 after:border-t after:border-brand-dark/5">
            <span className="mx-4 text-[10px] font-bold tracking-[0.25em] text-brand-dark/20 uppercase">Atau</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-brand-dark/10 bg-white py-3.5 font-display font-bold uppercase tracking-[0.2em] text-[0.7rem] text-brand-dark transition-all hover:bg-brand-light active:scale-[0.98] shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
            </svg>
            Masuk dengan Google
          </button>

          <p className="mt-8 text-center text-sm text-brand-dark/60 font-sans">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-brand-mid hover:text-brand-dark transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
      
      {/* Footer Area - Fixed Bottom for Login Context */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end text-[9px] font-bold tracking-[0.2em] text-brand-dark/15 pointer-events-none uppercase">
        <div className="w-1/2 pr-12 hidden lg:block">
          <p>© 2026 BANTU INDONESIA. KARYA ANAK BANGSA.</p>
        </div>
        <div className="w-1/2 flex justify-between px-6 sm:px-12 lg:px-24">
          {/* Custom page footer if needed */}
        </div>
      </div>
    </div>
  );
}
