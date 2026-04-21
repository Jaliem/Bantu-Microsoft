"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

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
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
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
    <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgba(19,27,46,0.02)] border border-[#bccabc]/15 max-w-2xl">
      <div className="flex items-center gap-3 mb-8 text-[#131b2e]">
        <Lock size={24} className="text-[#006d38]" />
        <div>
          <h2 className="text-xl font-bold font-display">Change Password</h2>
          <p className="text-sm text-[#3d4a3f] mt-1">Ensure your account is using a long, random password to stay secure.</p>
        </div>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-6">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-[16px] text-sm font-semibold border border-red-100">{error}</div>}
        {success && <div className="p-4 bg-green-50 text-[#006d38] rounded-[16px] text-sm font-semibold border border-green-100">{success}</div>}

        <div>
          <label className="block text-[10px] uppercase font-bold text-[#3d4a3f] mb-2 tracking-wider">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full p-3.5 rounded-[16px] text-sm text-[#131b2e] bg-[#f2f3ff] border border-transparent focus:bg-white focus:border-[#006d38] focus:ring-1 focus:ring-[#006d38] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#3d4a3f] hover:text-[#131b2e] cursor-pointer"
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-[#3d4a3f] mb-2 tracking-wider">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3.5 rounded-[16px] text-sm text-[#131b2e] bg-[#f2f3ff] border border-transparent focus:bg-white focus:border-[#006d38] focus:ring-1 focus:ring-[#006d38] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#3d4a3f] hover:text-[#131b2e] cursor-pointer"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="bg-[#006d38] text-white font-semibold px-8 py-3.5 rounded-[16px] hover:bg-[#00aa5b] transition-colors shadow-[0_4px_20px_rgba(19,27,46,0.05)] cursor-pointer disabled:opacity-70 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
