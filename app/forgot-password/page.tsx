"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden w-1/2 flex-col justify-center bg-[#F4F9F7] p-12 lg:flex relative overflow-hidden">
        <div className="absolute top-10 left-10 text-green-700 font-bold text-2xl tracking-wide">BANTU</div>
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Reset Password
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Masukkan email yang terdaftar untuk menerima tautan reset password.
          </p>
        </div>
        <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-[#E1EDEB] rounded-full blur-sm -z-0"></div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
            <p className="mt-2 text-gray-600">Enter your email address to recover your account.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-600 border border-green-100">
              <CheckCircle size={16} />
              <p>Email reset password telah dikirim! Silakan periksa inbox Anda.</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800" htmlFor="email">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-gray-200 bg-[#F3F4F6] py-3 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 transition-colors"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#008A45] py-3 font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-[#008A45] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
