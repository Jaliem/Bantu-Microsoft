"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function NotifikasiPage() {
  const { user } = useAuth();
  
  const [jobUpdates, setJobUpdates] = useState(true);
  const [marketing, setMarketing] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSavePreferences = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Here you would also save preferences to Firestore
      // await setDoc(doc(db, "users", user.uid), { preferences: { jobUpdates, marketing } }, { merge: true });

      // Trigger a test email if they have an email address
      if (user?.email) {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: user.email,
            subject: "BANTU Notification Preferences Updated",
            html: `
              <div style="font-family: sans-serif; color: #131b2e;">
                <h2 style="color: #006d38;">Your preferences have been saved!</h2>
                <p>Hello,</p>
                <p>Your email notification settings on BANTU have been successfully updated.</p>
                <ul>
                  <li><strong>Job Updates:</strong> ${jobUpdates ? 'Enabled' : 'Disabled'}</li>
                  <li><strong>Marketing & Promos:</strong> ${marketing ? 'Enabled' : 'Disabled'}</li>
                </ul>
                <p>Thank you for using BANTU!</p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          setMessage("Preferences saved! A test email has been sent to your inbox.");
        } else {
          setMessage("Preferences saved, but we couldn't send the test email. Please check your SMTP settings in .env.local.");
        }
      } else {
        setMessage("Preferences saved successfully.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgba(19,27,46,0.02)] border border-[#bccabc]/15 max-w-2xl">
      <div className="flex items-center gap-3 mb-8 text-[#131b2e]">
        <Bell size={24} className="text-[#006d38]" />
        <div>
          <h2 className="text-xl font-bold font-display">Email Notifications</h2>
          <p className="text-sm text-[#3d4a3f] mt-1">Manage what emails you receive from BANTU.</p>
        </div>
      </div>

      <div className="space-y-6">
        {message && (
          <div className="p-4 bg-[#f2f3ff] text-[#006d38] rounded-[16px] text-sm font-semibold border border-[#bccabc]/20">
            {message}
          </div>
        )}

        <div className="flex items-start gap-4 p-4 rounded-[16px] bg-[#f2f3ff] border border-[#bccabc]/15">
          <div className="flex h-6 items-center">
            <input
              id="jobUpdates"
              type="checkbox"
              checked={jobUpdates}
              onChange={(e) => setJobUpdates(e.target.checked)}
              className="h-5 w-5 rounded border-[#bccabc] text-[#006d38] focus:ring-[#006d38] cursor-pointer"
            />
          </div>
          <div className="text-sm flex-1">
            <label htmlFor="jobUpdates" className="font-bold text-[#131b2e] cursor-pointer block">
              Job Updates
            </label>
            <p className="text-[#3d4a3f] mt-1">Receive an email when someone applies to or takes your job.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-[16px] bg-[#f2f3ff] border border-[#bccabc]/15">
          <div className="flex h-6 items-center">
            <input
              id="marketing"
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="h-5 w-5 rounded border-[#bccabc] text-[#006d38] focus:ring-[#006d38] cursor-pointer"
            />
          </div>
          <div className="text-sm flex-1">
            <label htmlFor="marketing" className="font-bold text-[#131b2e] cursor-pointer block">
              Marketing & Promos
            </label>
            <p className="text-[#3d4a3f] mt-1">Receive news, special offers, and updates from BANTU ecosystem.</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSavePreferences}
            disabled={loading}
            className="bg-[#006d38] text-white font-semibold px-8 py-3.5 rounded-[16px] hover:bg-[#00aa5b] transition-colors shadow-[0_4px_20px_rgba(19,27,46,0.05)] cursor-pointer flex items-center gap-2 disabled:opacity-70"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
