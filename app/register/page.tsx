"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Store, User, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"UMKM" | "Mahasiswa">("UMKM");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email automatically
      await sendEmailVerification(user);
      
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        createdAt: new Date(),
      });

      // Send Professional Welcome Email
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: "Welcome to BANTU! 🎉",
            html: `
              <div style="font-family: 'Inter', sans-serif; color: #131b2e; max-w: 600px; margin: 0 auto; padding: 32px; border: 1px solid #bccabc; border-radius: 24px; background-color: #faf8ff;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #006d38; font-size: 32px; margin: 0; letter-spacing: -0.5px;">BANTU</h1>
                  <p style="color: #3d4a3f; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Premium Ecosystem</p>
                </div>
                <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #bccabc;">
                  <h2 style="margin-top: 0; color: #131b2e;">Welcome, ${name}!</h2>
                  <p style="font-size: 15px; line-height: 1.6; color: #3d4a3f;">
                    Thank you for joining the BANTU ecosystem as a <strong>${role}</strong>. We are thrilled to have you on board! You are now part of a growing community driving local innovation across Indonesia.
                  </p>
                  <p style="font-size: 15px; line-height: 1.6; color: #3d4a3f;">
                    To get the most out of your experience, please complete your profile and verify your email address. 
                  </p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://bantu.com/profile" style="background-color: #006d38; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Go to Dashboard</a>
                  </div>
                </div>
                <p style="font-size: 10px; font-weight: bold; color: #3d4a3f; text-align: center; margin-top: 32px; letter-spacing: 1px; text-transform: uppercase;">
                  © 2024 BANTU INDONESIA. KARYA ANAK BANGSA.
                </p>
              </div>
            `
          })
        });
      } catch (e) {
        console.error("Failed to send welcome email", e);
      }

      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to sign up.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      let avatarUrl = user.photoURL || "";

      // Upload Google Avatar to Cloudinary
      if (avatarUrl) {
        try {
          const formData = new FormData();
          formData.append("file", avatarUrl);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            avatarUrl = data.url;
          }
        } catch (uploadError) {
          console.error("Cloudinary upload failed, using original Google URL", uploadError);
        }
      }
      
      const userDocRef = doc(db, "users", user.uid);
      
      // Check if user is new to send welcome email
      const docSnap = await getDoc(userDocRef);
      const isNewUser = !docSnap.exists();

      await setDoc(userDocRef, {
        name: user.displayName || "User",
        email: user.email,
        role, // Using the currently selected role
        avatarUrl,
        createdAt: new Date(),
      }, { merge: true });

      if (isNewUser && user.email) {
        try {
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: user.email,
              subject: "Welcome to BANTU! 🎉",
              html: `
                <div style="font-family: 'Inter', sans-serif; color: #131b2e; max-w: 600px; margin: 0 auto; padding: 32px; border: 1px solid #bccabc; border-radius: 24px; background-color: #faf8ff;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #006d38; font-size: 32px; margin: 0; letter-spacing: -0.5px;">BANTU</h1>
                    <p style="color: #3d4a3f; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Premium Ecosystem</p>
                  </div>
                  <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #bccabc;">
                    <h2 style="margin-top: 0; color: #131b2e;">Welcome, ${user.displayName || "User"}!</h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #3d4a3f;">
                      Thank you for joining the BANTU ecosystem as a <strong>${role}</strong>. We are thrilled to have you on board! You are now part of a growing community driving local innovation across Indonesia.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6; color: #3d4a3f;">
                      To get the most out of your experience, please complete your profile. 
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="https://bantu.com/profile" style="background-color: #006d38; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Go to Dashboard</a>
                    </div>
                  </div>
                  <p style="font-size: 10px; font-weight: bold; color: #3d4a3f; text-align: center; margin-top: 32px; letter-spacing: 1px; text-transform: uppercase;">
                    © 2024 BANTU INDONESIA. KARYA ANAK BANGSA.
                  </p>
                </div>
              `
            })
          });
        } catch (e) {
          console.error("Failed to send welcome email via Google Sign Up", e);
        }
      }

      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Panel */}
      <div className="hidden w-1/2 flex-col justify-center bg-[#E6EBEA] p-12 lg:flex relative overflow-hidden">
        <div className="absolute top-10 left-10 text-[#008A45] font-bold text-2xl tracking-wide">BANTU</div>
        
        <div className="relative z-10 max-w-lg mt-20">
          <h1 className="text-[48px] font-bold text-gray-900 leading-tight">
            Empowering <br /> Indonesia's <span className="text-[#008A45]">Next Generation</span>
          </h1>
          <p className="mt-6 text-gray-700 text-lg leading-relaxed">
            Connect with thousands of Mahasiswa or grow your UMKM through our verified, precision-built ecosystem.
          </p>

          <div className="mt-12 flex gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm w-1/2">
              <div className="text-[#008A45] mb-4">
                <Store size={24} className="fill-current" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Trusted UMKM</h3>
              <p className="text-sm text-gray-600">Verified business profiles across Indonesia.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm w-1/2">
              <div className="text-[#008A45] mb-4">
                <User size={24} className="fill-current" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Top Talent</h3>
              <p className="text-sm text-gray-600">Access skilled Mahasiswa for project-based work.</p>
            </div>
          </div>
        </div>

        {/* Abstract background pattern */}
        <div className="absolute bottom-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at bottom right, #008A45 0%, transparent 60%)" }}></div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 lg:w-1/2 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-[32px] font-bold text-[#111827]">Create Account</h2>
            <p className="mt-2 text-gray-600">Join the community driving local innovation.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole("UMKM")}
              className={`flex-1 flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                role === "UMKM" ? "border-[#008A45] bg-[#F0FDF4]" : "border-gray-100 bg-[#F9FAFB] hover:bg-gray-50"
              }`}
            >
              <div className="mr-3 text-gray-700"><Store size={20} /></div>
              <div className="text-left">
                <div className="font-bold text-sm text-gray-900">Join as UMKM</div>
                <div className="text-xs text-gray-500">I have a business</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole("Mahasiswa")}
              className={`flex-1 flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                role === "Mahasiswa" ? "border-[#008A45] bg-[#F0FDF4]" : "border-gray-100 bg-[#F9FAFB] hover:bg-gray-50"
              }`}
            >
              <div className="mr-3 text-gray-700"><User size={20} /></div>
              <div className="text-left">
                <div className="font-bold text-sm text-gray-900">Join as Mahasiswa</div>
                <div className="text-xs text-gray-500">I am a student</div>
              </div>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-md border border-gray-200 bg-white py-3 px-4 text-gray-900 focus:border-[#008A45] focus:outline-none focus:ring-1 focus:ring-[#008A45]"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-200 bg-white py-3 px-4 text-gray-900 focus:border-[#008A45] focus:outline-none focus:ring-1 focus:ring-[#008A45]"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 bg-white py-3 pl-4 pr-10 text-gray-900 focus:border-[#008A45] focus:outline-none focus:ring-1 focus:ring-[#008A45]"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 bg-white py-3 pl-4 pr-10 text-gray-900 focus:border-[#008A45] focus:outline-none focus:ring-1 focus:ring-[#008A45]"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-start pt-2 pb-2">
              <div className="flex h-5 items-center">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#008A45] focus:ring-[#008A45] cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeTerms" className="font-medium text-gray-600">
                  I agree to the <span className="text-[#008A45] font-semibold cursor-pointer" onClick={() => window.open('/terms-of-service', '_blank')}>Terms of Service</span> and <span className="text-[#008A45] font-semibold cursor-pointer" onClick={() => window.open('/privacy-policy', '_blank')}>Privacy Policy</span>.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#008A45] py-3.5 font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#008A45] focus:ring-offset-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="my-8 flex items-center before:flex-1 before:border-t before:border-gray-200 after:flex-1 after:border-t after:border-gray-200">
            <span className="mx-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">OR CONTINUE WITH</span>
          </div>

          <button
            onClick={handleGoogleSignup}
            type="button"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-200 bg-white py-3.5 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-70 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
            </svg>
            Sign up with Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#008A45] hover:underline">
              Log in
            </Link>
          </p>
          
        </div>
      </div>
    </div>
  );
}
