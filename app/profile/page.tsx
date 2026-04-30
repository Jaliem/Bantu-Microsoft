"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { Camera, MapPin, Pencil, X, Plus, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function ProfilePersonalInfoPage() {
  const { user } = useAuth();
  
  const [userData, setUserData] = useState<any>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "Jakarta Selatan, Indonesia",
    bio: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setFormData({
            name: data.name || user.displayName || "",
            phone: data.phone || "",
            location: data.location || "Jakarta Selatan, Indonesia",
            bio: data.bio || "",
          });
          setSkills(data.skills || ["Business Strategy", "Supply Chain", "E-Commerce", "Mentorship"]);

          if (data.role === 'UMKM') {
            const qCount = query(
              collection(db, "projects"),
              where("umkmId", "==", user.uid)
            );
            const countSnap = await getDocs(qCount);
            setProjectCount(countSnap.size);
          }
        }
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updatedData = {
        ...userData,
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        skills: skills,
      };
      
      await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });
      
      setUserData(updatedData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to save profile", error);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !user) return;
    
    const skillToAdd = newSkill.trim();
    if (skills.includes(skillToAdd)) {
      toast.error("Skill sudah ada!");
      return;
    }

    const updatedSkills = [...skills, skillToAdd];
    setSkills(updatedSkills);
    setUserData((prev: any) => ({ ...prev, skills: updatedSkills }));
    setNewSkill("");
    setAddingSkill(false);

    try {
      await setDoc(doc(db, "users", user.uid), { skills: updatedSkills }, { merge: true });
      toast.success("Skill added!");
    } catch (error) {
      console.error("Failed to save skill", error);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!user) return;
    const updatedSkills = skills.filter(s => s !== skillToRemove);
    setSkills(updatedSkills);
    setUserData((prev: any) => ({ ...prev, skills: updatedSkills }));

    try {
      await setDoc(doc(db, "users", user.uid), { skills: updatedSkills }, { merge: true });
    } catch (error) {
      console.error("Failed to save skill", error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    
    setUploadingAvatar(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        const newAvatarUrl = data.url;
        
        await setDoc(doc(db, "users", user.uid), {
          avatarUrl: newAvatarUrl
        }, { merge: true });

        setUserData((prev: any) => ({ ...prev, avatarUrl: newAvatarUrl }));
        toast.success("Profile picture updated!");
      }
    } catch (error) {
      console.error("Avatar upload error", error);
      toast.error("Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResendVerification = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        setVerificationSent(true);
        toast.success("Verification email sent!");
      } catch (error) {
        console.error("Failed to send verification email", error);
        toast.error("Failed to send verification email.");
      }
    }
  };

  const avatar = userData?.avatarUrl || user?.photoURL || null;

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Left Column - Profile Card */}
      <div className="w-full lg:w-80 shrink-0 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-ambient border border-brand-dark/5">
          <div className="relative mb-6">
            <div className={`w-32 h-32 rounded-[2.5rem] overflow-hidden border-[6px] border-brand-light shadow-ambient ${uploadingAvatar ? 'opacity-50' : ''}`}>
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-mid/10 flex items-center justify-center text-brand-mid text-4xl font-display font-bold">
                  {formData.name.charAt(0) || "U"}
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand-mid rounded-2xl flex items-center justify-center text-white border-4 border-white hover:bg-brand-dark transition-all cursor-pointer shadow-lg shadow-brand-mid/20"
            >
              {uploadingAvatar ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Camera size={18} />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
          
          <h2 className="text-2xl font-display font-bold text-brand-dark leading-tight">{formData.name}</h2>
          
          {user?.emailVerified ? (
            <div className="bg-brand-mid/10 text-brand-mid text-[9px] font-bold px-4 py-2 rounded-full mt-4 inline-flex items-center gap-2 uppercase tracking-widest border border-brand-mid/20">
              <CheckCircle2 size={12} />
              VERIFIED {userData?.role || 'UMKM'}
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="bg-red-50 text-red-600 text-[9px] font-bold px-4 py-2 rounded-full mt-4 inline-flex items-center gap-2 uppercase tracking-widest border border-red-100">
                <ShieldAlert size={12} />
                UNVERIFIED
              </div>
              {!verificationSent ? (
                <button 
                  onClick={handleResendVerification}
                  className="mt-3 text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline cursor-pointer opacity-60 hover:opacity-100"
                >
                  Resend Verification
                </button>
              ) : (
                <span className="mt-3 text-[10px] font-bold text-brand-mid uppercase tracking-widest">Email Sent!</span>
              )}
            </div>
          )}

          <div className="w-full h-px bg-brand-dark/5 my-8" />

          <p className="text-sm text-brand-dark/50 leading-relaxed font-sans font-light">
            {formData.bio || "Focused on helping local businesses grow through digital transformation and strategic planning."}
          </p>

          {userData?.role === "Mahasiswa" && user?.uid && (
            <div className="w-full mt-8">
              <Link 
                href={`/portfolio/${user.uid}`}
                className="w-full bg-brand-light text-brand-mid font-display font-bold flex items-center justify-center gap-2 hover:bg-brand-mid hover:text-white px-6 py-4 rounded-2xl transition-all cursor-pointer text-[10px] uppercase tracking-widest shadow-sm"
              >
                <CheckCircle2 size={14} />
                {t('Lihat Portofolio Saya')}
              </Link>
            </div>
          )}

          {userData?.role === "UMKM" && user?.uid && (
            <div className="w-full mt-8">
              <Link 
                href={`/umkm/${user.uid}`}
                className="w-full bg-brand-light text-brand-mid font-display font-bold flex items-center justify-center gap-2 hover:bg-brand-mid hover:text-white px-6 py-4 rounded-2xl transition-all cursor-pointer text-[10px] uppercase tracking-widest shadow-sm"
              >
                <CheckCircle2 size={14} />
                {t('Lihat Profil UMKM Saya')}
              </Link>
            </div>
          )}
        </div>

        <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mid/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <h3 className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6 relative z-10">Skill Portfolio</h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            <AnimatePresence>
              {skills.map(skill => (
                <motion.span 
                  key={skill} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white/10 px-4 py-2 rounded-full text-[11px] font-bold text-white/80 border border-white/5 flex items-center gap-2 group/skill"
                >
                  {skill}
                  {isEditing && (
                    <button onClick={() => handleRemoveSkill(skill)} className="text-white/40 hover:text-red-400 transition-colors cursor-pointer">
                      <X size={12} />
                    </button>
                  )}
                </motion.span>
              ))}
            </AnimatePresence>
            
            {isEditing && (
              addingSkill ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white rounded-full shadow-sm overflow-hidden border border-brand-mid/20">
                    <input 
                      type="text" 
                      value={newSkill} 
                      onChange={e => setNewSkill(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                      autoFocus
                      className="px-4 py-2 text-[11px] text-brand-dark outline-none w-28 bg-transparent font-bold"
                      placeholder="..."
                    />
                  </div>
                  <button onClick={handleAddSkill} className="bg-brand-mid text-white px-5 py-2 rounded-full hover:bg-brand-dark cursor-pointer text-[10px] font-bold transition-all shadow-lg shadow-brand-mid/20">
                    Add
                  </button>
                </div>
              ) : (
                <button onClick={() => setAddingSkill(true)} className="bg-brand-mid text-white px-5 py-2 rounded-full text-[10px] font-bold flex items-center gap-2 hover:bg-white hover:text-brand-dark transition-all cursor-pointer shadow-lg shadow-brand-mid/20">
                  <Plus size={14} /> Add Skill
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col gap-8">
        <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-ambient border border-brand-dark/5">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-brand-dark tracking-tight">{t('Personal Details')}</h2>
              <p className="text-brand-dark/40 text-sm mt-1">{t('Update your public profile and contact information.')}</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-brand-light text-brand-mid font-display font-bold flex items-center gap-2 hover:bg-brand-mid hover:text-white px-6 py-3 rounded-2xl transition-all cursor-pointer text-[10px] uppercase tracking-widest shadow-sm"
              >
                <Pencil size={14} />
                {t('Edit Profile')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 ml-1">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                disabled={!isEditing}
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-4 rounded-2xl text-sm text-brand-dark focus:outline-none transition-all ${
                  isEditing 
                    ? "bg-white border-2 border-brand-mid/20 focus:border-brand-mid shadow-lg shadow-brand-mid/5" 
                    : "bg-brand-light/50 border-2 border-transparent"
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 ml-1">Email Address</label>
              <input
                type="email"
                disabled={true}
                value={user?.email || ""}
                className="w-full p-4 rounded-2xl text-sm text-brand-dark/40 bg-brand-light/30 border-2 border-transparent focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 ml-1">Nomor Telepon</label>
              <input
                type="tel"
                name="phone"
                disabled={!isEditing}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+62 812 3456 7890"
                className={`w-full p-4 rounded-2xl text-sm text-brand-dark focus:outline-none transition-all ${
                  isEditing 
                    ? "bg-white border-2 border-brand-mid/20 focus:border-brand-mid shadow-lg shadow-brand-mid/5" 
                    : "bg-brand-light/50 border-2 border-transparent"
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 ml-1">Lokasi</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  disabled={!isEditing}
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full p-4 pr-12 rounded-2xl text-sm text-brand-dark focus:outline-none transition-all ${
                    isEditing 
                      ? "bg-white border-2 border-brand-mid/20 focus:border-brand-mid shadow-lg shadow-brand-mid/5" 
                      : "bg-brand-light/50 border-2 border-transparent"
                  }`}
                />
                <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/20" />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 ml-1">Bio Profile</label>
              <textarea
                name="bio"
                disabled={!isEditing}
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Entrepreneur and business consultant with over 10 years of experience..."
                className={`w-full p-5 rounded-2xl text-sm text-brand-dark focus:outline-none resize-none transition-all leading-relaxed ${
                  isEditing 
                    ? "bg-white border-2 border-brand-mid/20 focus:border-brand-mid shadow-lg shadow-brand-mid/5" 
                    : "bg-brand-light/50 border-2 border-transparent"
                }`}
              />
            </div>
          </div>
          
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-end items-center gap-4 mt-12 pt-8 border-t border-brand-dark/5"
              >
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: userData?.name || user?.displayName || "",
                      phone: userData?.phone || "",
                      location: userData?.location || "Jakarta Selatan, Indonesia",
                      bio: userData?.bio || "",
                    });
                  }}
                  className="text-brand-dark/40 font-display font-bold px-8 py-4 hover:text-brand-dark transition-colors cursor-pointer text-[10px] uppercase tracking-widest"
                >
                  Discard Changes
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-brand-mid text-white font-display font-bold px-10 py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand-mid/20 disabled:opacity-70 flex items-center gap-3 cursor-pointer text-[10px] uppercase tracking-widest"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Save Changes
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Section */}
        <div className="bg-brand-light rounded-[2.5rem] p-12 border border-brand-dark/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-mid/5 rounded-full blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <p className="text-[10px] font-bold text-brand-mid uppercase tracking-[0.2em] mb-4">Member Status</p>
              <h3 className="text-xl font-display font-bold text-brand-dark mb-1">
                Sejak {userData?.createdAt?.toDate ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(userData.createdAt.toDate()) : 'Baru Bergabung'}
              </h3>
              <p className="text-xs text-brand-dark/40 font-sans">Active contributor since registration.</p>
            </div>
            
            <div className="flex gap-16">
              <div>
                <div className="text-5xl font-display font-black tracking-tighter text-brand-dark">
                  {userData?.role === 'UMKM' ? projectCount : (userData?.completedTasks || 0)}
                </div>
                <div className="text-[9px] uppercase font-bold text-brand-dark/30 mt-2 tracking-widest">{userData?.role === 'UMKM' ? 'Projects Posted' : 'Tasks Done'}</div>
              </div>
              <div>
                <div className="text-5xl font-display font-black tracking-tighter text-brand-dark">
                  {userData?.avgRating?.toFixed(1) || '0.0'}<span className="text-xl text-brand-dark/20 font-bold">/5</span>
                </div>
                <div className="text-[9px] uppercase font-bold text-brand-dark/30 mt-2 tracking-widest">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
