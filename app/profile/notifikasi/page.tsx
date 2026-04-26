"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function NotifikasiPage() {
  const { user } = useAuth();
  
  const [jobUpdates, setJobUpdates] = useState(true);
  const [marketing, setMarketing] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // Load existing preferences from Firestore
  useEffect(() => {
    const loadPrefs = async () => {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.preferences) {
            setJobUpdates(data.preferences.jobUpdates ?? true);
            setMarketing(data.preferences.marketing ?? false);
          }
        }
      } catch (e) {
        console.error("Failed to load preferences", e);
      }
    };
    loadPrefs();
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Save preferences to Firestore
      await setDoc(doc(db, "users", user.uid), {
        preferences: { jobUpdates, marketing }
      }, { merge: true });

      // Send professional confirmation email
      if (user.email) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: user.email,
            subject: "BANTU — Notification Preferences Updated ✅",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #006d38 0%, #00aa5b 100%); padding: 40px 32px; text-align: center; border-radius: 0 0 32px 32px;">
                  <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0; letter-spacing: -0.5px;">BANTU</h1>
                  <p style="color: rgba(255,255,255,0.8); font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0;">Notification Settings</p>
                </div>
                <div style="padding: 40px 32px;">
                  <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 22px;">Preferences Updated ✅</h2>
                  <p style="font-size: 15px; line-height: 1.7; color: #4b5563; margin: 0 0 24px 0;">
                    Your email notification preferences have been successfully saved.
                  </p>
                  <div style="background-color: #f8f9fe; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; font-size: 14px; color: #4b5563;">Job Updates</td>
                        <td style="padding: 10px 0; font-size: 14px; font-weight: 700; text-align: right; color: ${jobUpdates ? '#006d38' : '#ef4444'};">${jobUpdates ? '✅ Enabled' : '❌ Disabled'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; font-size: 14px; color: #4b5563; border-top: 1px solid #e5e7eb;">Marketing & Promos</td>
                        <td style="padding: 10px 0; font-size: 14px; font-weight: 700; text-align: right; border-top: 1px solid #e5e7eb; color: ${marketing ? '#006d38' : '#ef4444'};">${marketing ? '✅ Enabled' : '❌ Disabled'}</td>
                      </tr>
                    </table>
                  </div>
                  <p style="font-size: 13px; color: #9ca3af; text-align: center;">You can update these settings anytime in your account.</p>
                </div>
                <div style="border-top: 1px solid #f3f4f6; padding: 24px 32px; text-align: center;">
                  <p style="font-size: 10px; font-weight: 700; color: #9ca3af; letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">© 2024 BANTU INDONESIA • KARYA ANAK BANGSA</p>
                </div>
              </div>
            `,
          }),
        });
      }

      toast.success("Preferences saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save preferences.");
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
