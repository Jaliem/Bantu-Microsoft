"use client";

import React, { useState, useEffect } from "react";
import { Bell, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function NotifikasiPage() {
  const { user } = useAuth();
  
  const [jobUpdates, setJobUpdates] = useState(true);
  const [marketing, setMarketing] = useState(false);
  
  const [loading, setLoading] = useState(false);

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
      await setDoc(doc(db, "users", user.uid), {
        preferences: { jobUpdates, marketing }
      }, { merge: true });

      toast.success("Notification preferences saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-ambient border border-brand-dark/5 max-w-2xl">
      <div className="flex items-center gap-5 mb-12">
        <div className="w-14 h-14 rounded-2xl bg-brand-mid/10 flex items-center justify-center text-brand-mid shrink-0">
          <Bell size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-brand-dark tracking-tight">Email Notifications</h2>
          <p className="text-sm text-brand-dark/40 mt-1 font-sans font-light">Manage what emails you receive from BANTU.</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { 
            id: "jobUpdates", 
            title: "Job Updates", 
            desc: "Receive an email when someone applies to or takes your job.",
            state: jobUpdates,
            setter: setJobUpdates
          },
          { 
            id: "marketing", 
            title: "Marketing & Promos", 
            desc: "Receive news, special offers, and updates from BANTU ecosystem.",
            state: marketing,
            setter: setMarketing
          }
        ].map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ scale: 1.01 }}
            className={`flex items-start gap-5 p-6 rounded-3xl border-2 transition-all cursor-pointer ${
              item.state ? 'bg-brand-mid/5 border-brand-mid/10' : 'bg-brand-light/30 border-transparent hover:bg-brand-light'
            }`}
            onClick={() => item.setter(!item.state)}
          >
            <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.state ? 'bg-brand-mid border-brand-mid' : 'border-brand-dark/10 bg-white'}`}>
              {item.state && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-display font-bold ${item.state ? 'text-brand-dark' : 'text-brand-dark/60'}`}>{item.title}</h4>
              <p className="text-xs text-brand-dark/40 mt-1 leading-relaxed font-sans font-light">{item.desc}</p>
            </div>
          </motion.div>
        ))}

        <div className="pt-8 flex justify-end">
          <button 
            onClick={handleSavePreferences}
            disabled={loading}
            className="bg-brand-mid hover:bg-brand-dark text-white font-display font-bold py-4 px-10 rounded-full text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-brand-mid/20 disabled:opacity-70 flex items-center gap-3 active:scale-95"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Save Preferences
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-brand-light/50 rounded-3xl border border-brand-dark/5 flex gap-4">
        <Mail className="text-brand-mid shrink-0" size={20} />
        <p className="text-[11px] text-brand-dark/40 leading-relaxed font-sans font-light">
          We respect your privacy. You can also unsubscribe directly from the footer of any email we send you.
        </p>
      </div>
    </div>
  );
}
