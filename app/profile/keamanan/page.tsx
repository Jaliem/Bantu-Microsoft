"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { motion } from "framer-motion";

export default function KeamananPage() {
  const { user } = useAuth();
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!user || !user.email) {
      setError("You must be logged in to change your password.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError("Current password is incorrect.");
      } else {
        setError("Failed to update password. " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-ambient border border-brand-dark/5 max-w-2xl">
      <div className="flex items-center gap-5 mb-12">
        <div className="w-14 h-14 rounded-2xl bg-brand-mid/10 flex items-center justify-center text-brand-mid shrink-0">
          <Lock size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-brand-dark tracking-tight">Change Password</h2>
          <p className="text-sm text-brand-dark/40 mt-1 font-sans font-light">Ensure your account is using a long, random password to stay secure.</p>
        </div>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-8">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest border border-red-100 flex items-center gap-3">
            <ShieldCheck size={16} className="rotate-180" /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-brand-mid/5 text-brand-mid rounded-2xl text-xs font-bold uppercase tracking-widest border border-brand-mid/10 flex items-center gap-3">
            <ShieldCheck size={16} /> {success}
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 ml-1">Current Password</label>
          <div className="relative group">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full p-4 rounded-2xl text-sm text-brand-dark bg-brand-light/50 border-2 border-transparent focus:bg-white focus:border-brand-mid focus:ring-4 focus:ring-brand-mid/5 transition-all outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-5 text-brand-dark/20 hover:text-brand-mid transition-colors cursor-pointer"
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 ml-1">New Password</label>
          <div className="relative group">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-4 rounded-2xl text-sm text-brand-dark bg-brand-light/50 border-2 border-transparent focus:bg-white focus:border-brand-mid focus:ring-4 focus:ring-brand-mid/5 transition-all outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-5 text-brand-dark/20 hover:text-brand-mid transition-colors cursor-pointer"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="bg-brand-mid hover:bg-brand-dark text-white font-display font-bold py-4 px-10 rounded-full text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-brand-mid/20 disabled:opacity-70 flex items-center gap-3 active:scale-95"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
