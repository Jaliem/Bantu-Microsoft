"use client";

import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, User, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { user: currentUser, userData: currentUserData } = useAuth();
  const [role, setRole] = useState<"UMKM" | "Mahasiswa">("UMKM");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUserData?.verified === true) {
      router.push("/dashboard");
    }
  }, [currentUser, currentUserData, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        verified: false,
        createdAt: new Date(),
      });

      // Send Professional Welcome Email
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: "Welcome to BANTU — Please Verify Your Email ✉️",
            html: `
              <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #eef5f0; padding: 40px 20px;">
                <div style="background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 10px 40px rgba(11, 28, 20, 0.05); border: 1px solid rgba(11, 28, 20, 0.05);">
                  <div style="background: linear-gradient(135deg, #006d38 0%, #0b1c14 100%); padding: 48px 32px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 32px; margin: 0; letter-spacing: -1px; font-weight: 800;">BANTU<span style="color: #eef5f0;">.</span></h1>
                    <p style="color: rgba(238, 245, 240, 0.7); font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 12px 0 0 0;">Connecting UMKM × Mahasiswa</p>
                  </div>
                  <div style="padding: 48px 40px;">
                    <h2 style="color: #0b1c14; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">Selamat bergabung, ${name}! 🎉</h2>
                    <p style="font-size: 16px; line-height: 1.7; color: #4a6654; margin: 0 0 20px 0;">
                      Terima kasih telah bergabung dengan BANTU sebagai <strong style="color: #006d38;">${role}</strong>. Anda kini menjadi bagian dari ekosistem yang menghubungkan bisnis lokal dengan talenta mahasiswa terbaik di Indonesia.
                    </p>
                    <p style="font-size: 16px; line-height: 1.7; color: #4a6654; margin: 0 0 32px 0;">
                      Satu langkah lagi! Silakan verifikasi email Anda untuk mulai mengakses platform:
                    </p>
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="https://bantu.darrenharyanto.com/verify/${user.uid}" style="background-color: #006d38; color: #ffffff; padding: 18px 48px; border-radius: 100px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 10px 20px rgba(0, 109, 56, 0.2);">Verifikasi Email Saya</a>
                    </div>
                    <div style="background-color: #f8faf9; border-radius: 20px; padding: 24px; margin-top: 40px; border: 1px solid rgba(11, 28, 20, 0.03);">
                      <p style="font-size: 13px; color: #4a6654; margin: 0; line-height: 1.6;">🔒 Jika Anda tidak merasa membuat akun ini, silakan abaikan email ini.</p>
                    </div>
                  </div>
                  <div style="background-color: #f8faf9; padding: 32px; text-align: center; border-top: 1px solid rgba(11, 28, 20, 0.03);">
                    <p style="font-size: 11px; font-weight: 700; color: #4a6654; letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">© 2024 BANTU INDONESIA • KARYA ANAK BANGSA</p>
                  </div>
                </div>
              </div>
            `
          })
        });
      } catch (e) {
        console.error("Failed to send welcome email", e);
      }

      await firebaseSignOut(auth);
      router.push("/login");
      toast.success("Account created! Please check your email to verify your account.");
    } catch (err: any) {
      toast.error(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!agreeTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      let avatarUrl = user.photoURL || "";

      if (avatarUrl) {
        try {
          const formData = new FormData();
          formData.append("file", avatarUrl);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            avatarUrl = data.url;
          }
        } catch (uploadError) {
          console.error("Cloudinary upload failed", uploadError);
        }
      }
      
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      const isNewUser = !docSnap.exists();

      await setDoc(userDocRef, {
        name: user.displayName || "User",
        email: user.email,
        role,
        avatarUrl,
        verified: false,
        createdAt: new Date(),
      }, { merge: true });

      if (isNewUser && user.email) {
        try {
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: user.email,
              subject: "Welcome to BANTU — Please Verify Your Email ✉️",
              html: `
                <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #eef5f0; padding: 40px 20px;">
                  <div style="background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 10px 40px rgba(11, 28, 20, 0.05); border: 1px solid rgba(11, 28, 20, 0.05);">
                    <div style="background: linear-gradient(135deg, #006d38 0%, #0b1c14 100%); padding: 48px 32px; text-align: center;">
                      <h1 style="color: #ffffff; font-size: 32px; margin: 0; letter-spacing: -1px; font-weight: 800;">BANTU<span style="color: #eef5f0;">.</span></h1>
                      <p style="color: rgba(238, 245, 240, 0.7); font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 12px 0 0 0;">Connecting UMKM × Mahasiswa</p>
                    </div>
                    <div style="padding: 48px 40px;">
                      <h2 style="color: #0b1c14; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">Selamat bergabung, ${user.displayName || 'User'}! 🎉</h2>
                      <p style="font-size: 16px; line-height: 1.7; color: #4a6654; margin: 0 0 20px 0;">
                        Terima kasih telah bergabung dengan BANTU sebagai <strong style="color: #006d38;">${role}</strong>. Sebelum Anda dapat masuk, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:
                      </p>
                      <div style="text-align: center; margin: 40px 0;">
                        <a href="https://bantu.darrenharyanto.com/verify/${user.uid}" style="background-color: #006d38; color: #ffffff; padding: 18px 48px; border-radius: 100px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 10px 20px rgba(0, 109, 56, 0.2);">Verifikasi Email Saya</a>
                      </div>
                      <div style="background-color: #f8faf9; border-radius: 20px; padding: 24px; margin-top: 40px; border: 1px solid rgba(11, 28, 20, 0.03);">
                        <p style="font-size: 13px; color: #4a6654; margin: 0; line-height: 1.6;">🔒 Jika Anda tidak merasa membuat akun ini, silakan abaikan email ini.</p>
                      </div>
                    </div>
                    <div style="background-color: #f8faf9; padding: 32px; text-align: center; border-top: 1px solid rgba(11, 28, 20, 0.03);">
                      <p style="font-size: 11px; font-weight: 700; color: #4a6654; letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">© 2024 BANTU INDONESIA • KARYA ANAK BANGSA</p>
                    </div>
                  </div>
                </div>
              `
            })
          });
        } catch (e) {
          console.error("Failed to send welcome email", e);
        }
      }

      await firebaseSignOut(auth);
      router.push("/login");
      toast.success("Account created! Please check your email to verify your account.");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign up with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-y-auto pt-20 font-sans bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-brand-light p-16 relative overflow-hidden h-full">
        <div className="relative z-10 mt-8">
          <div className="max-w-md">
            <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] font-display font-semibold text-brand-dark leading-[1.1] mb-6 tracking-tight text-balance">
              Empowering Indonesia's <span className="text-brand-mid">Next Generation</span>
            </h1>
            <p className="text-brand-dark/70 text-lg leading-relaxed font-sans font-light text-balance">
              Hubungkan bisnis lokal Anda dengan talenta mahasiswa terbaik di Indonesia.
            </p>
          </div>
        </div>
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-brand-mid/5 rounded-full blur-3xl" />
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col justify-center bg-white px-6 sm:px-12 lg:w-1/2 lg:px-24 relative h-full">
        <div className="w-full max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 text-center lg:text-left"
          >
            <h2 className="text-4xl font-display font-semibold text-brand-dark tracking-tight">Create Account</h2>
            <p className="mt-2 text-brand-dark/60 font-sans">Daftar sekarang dan mulai perjalanan Anda.</p>
          </motion.div>

          {/* Role Selection */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole("UMKM")}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                role === "UMKM" ? "border-brand-mid bg-brand-mid/5" : "border-brand-dark/5 bg-brand-light/30 hover:bg-brand-light"
              }`}
            >
              <Store size={20} className={role === "UMKM" ? "text-brand-mid" : "text-brand-dark/40"} />
              <span className={`mt-2 font-display font-bold text-[10px] uppercase tracking-wider ${role === "UMKM" ? "text-brand-mid" : "text-brand-dark/40"}`}>UMKM</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("Mahasiswa")}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                role === "Mahasiswa" ? "border-brand-mid bg-brand-mid/5" : "border-brand-dark/5 bg-brand-light/30 hover:bg-brand-light"
              }`}
            >
              <User size={20} className={role === "Mahasiswa" ? "text-brand-mid" : "text-brand-dark/40"} />
              <span className={`mt-2 font-display font-bold text-[10px] uppercase tracking-wider ${role === "Mahasiswa" ? "text-brand-mid" : "text-brand-dark/40"}`}>Mahasiswa</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 ml-1" htmlFor="name">Nama Lengkap</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-2xl border-0 bg-brand-light/50 py-3 px-5 text-brand-dark placeholder:text-brand-dark/30 focus:ring-2 focus:ring-brand-mid transition-all font-sans outline-none text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 ml-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border-0 bg-brand-light/50 py-3 px-5 text-brand-dark placeholder:text-brand-dark/30 focus:ring-2 focus:ring-brand-mid transition-all font-sans outline-none text-sm"
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 ml-1" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border-0 bg-brand-light/50 py-3 pl-5 pr-10 text-brand-dark placeholder:text-brand-dark/30 focus:ring-2 focus:ring-brand-mid transition-all font-sans outline-none text-sm"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-dark/20 hover:text-brand-mid" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 ml-1" htmlFor="confirmPassword">Konfirmasi</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-2xl border-0 bg-brand-light/50 py-3 pl-5 pr-10 text-brand-dark placeholder:text-brand-dark/30 focus:ring-2 focus:ring-brand-mid transition-all font-sans outline-none text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-dark/20 hover:text-brand-mid" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center px-1 pt-1">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 rounded border-brand-dark/20 text-brand-mid focus:ring-brand-mid cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="ml-3 block text-xs text-brand-dark/60 font-sans cursor-pointer">
                I agree to the <span className="text-brand-mid font-bold">Terms</span> and <span className="text-brand-mid font-bold">Privacy</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-brand-mid py-3.5 font-display font-bold uppercase tracking-[0.2em] text-[0.7rem] text-white transition-all hover:bg-brand-dark active:scale-[0.98] shadow-xl shadow-brand-mid/20 disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="my-6 flex items-center before:flex-1 before:border-t before:border-brand-dark/5 after:flex-1 after:border-t after:border-brand-dark/5">
            <span className="mx-4 text-[10px] font-bold tracking-[0.25em] text-brand-dark/20 uppercase">Atau</span>
          </div>

          <button
            onClick={handleGoogleSignup}
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
            Google
          </button>

          <p className="mt-6 text-center text-sm text-brand-dark/60 font-sans">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand-mid hover:text-brand-dark transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end text-[9px] font-bold tracking-[0.2em] text-brand-dark/15 pointer-events-none uppercase">
        <div className="w-1/2 pr-12 hidden lg:block">
          <p>© 2024 BANTU INDONESIA. KARYA ANAK BANGSA.</p>
        </div>
      </div>
    </div>
  );
}
