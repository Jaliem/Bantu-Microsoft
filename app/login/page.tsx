"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
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
      
      router.push("/dashboard");
      toast.success("Successfully logged in!");
    } catch (err: any) {
      toast.error(err.message || "Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#F4F9F7] p-12 lg:flex relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-[#008A45] font-bold text-2xl tracking-wide mb-24">BANTU</div>
          <div className="max-w-md">
            <h1 className="text-[40px] font-bold text-gray-900 leading-tight mb-6">
              Pemberdayaan UMKM Indonesia Melalui Digitalisasi.
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Bergabunglah dengan ribuan pengusaha lokal untuk mengelola bisnis Anda dengan lebih cerdas dan efisien.
            </p>
          </div>
        </div>
        
        {/* Blob background */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-[#DFEBE7] rounded-full mix-blend-multiply opacity-80 blur-xl"></div>
        
        {/* Testimonial */}
        <div className="relative z-10 bg-white/80 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 max-w-sm shadow-sm">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
            {/* Placeholder for avatar */}
            <div className="w-full h-full bg-gray-300"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">"BANTU memudahkan operasional harian kami."</p>
            <p className="text-xs text-gray-500 mt-1">— Budi Santoso, Pemilik Kopi Lokal</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col justify-center bg-white px-8 lg:w-1/2 lg:px-24 relative">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[32px] font-bold text-[#111827]">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Masuk ke akun BANTU Anda untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800" htmlFor="email">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 bg-[#F3F4F6] py-3.5 px-4 text-gray-900 focus:ring-2 focus:ring-[#008A45] transition-all"
                placeholder="nama@email.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-800" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-[#008A45] hover:underline">
                  Lupa Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 bg-[#F3F4F6] py-3.5 px-4 text-gray-900 focus:ring-2 focus:ring-[#008A45] transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center mt-4 cursor-pointer">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#008A45] focus:ring-[#008A45] cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                Biarkan saya tetap masuk
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-md bg-[#008A45] py-3.5 font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#008A45] focus:ring-offset-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Loading..." : "Login ke Dashboard"}
            </button>
          </form>

          <div className="my-8 flex items-center before:flex-1 before:border-t before:border-gray-200 after:flex-1 after:border-t after:border-gray-200">
            <span className="mx-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">ATAU MASUK DENGAN</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-70 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
            </svg>
            Masuk dengan Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-[#008A45] hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
      
      {/* Footer Area - Fixed Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end text-xs text-gray-500 pointer-events-none">
        <div className="w-1/2 pr-12 hidden lg:block">
          <p>© 2024 BANTU INDONESIA. KARYA ANAK BANGSA.</p>
        </div>
        <div className="w-1/2 flex justify-between px-8 lg:px-24">
           {/* Footer links can go here if needed */}
        </div>
      </div>
    </div>
  );
}
