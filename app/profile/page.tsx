"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { Camera, MapPin, Pencil, X, Plus } from "lucide-react";

export default function ProfilePersonalInfoPage() {
  const { user } = useAuth();
  
  const [userData, setUserData] = useState<any>(null);
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
      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
      }, { merge: true });
      
      setUserData((prev: any) => ({ ...prev, ...formData }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !user) return;
    const updatedSkills = [...skills, newSkill.trim()];
    setSkills(updatedSkills);
    setNewSkill("");
    setAddingSkill(false);

    try {
      await setDoc(doc(db, "users", user.uid), { skills: updatedSkills }, { merge: true });
    } catch (error) {
      console.error("Failed to save skill", error);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!user) return;
    const updatedSkills = skills.filter(s => s !== skillToRemove);
    setSkills(updatedSkills);

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
      }
    } catch (error) {
      console.error("Avatar upload error", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResendVerification = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        setVerificationSent(true);
      } catch (error) {
        console.error("Failed to send verification email", error);
      }
    }
  };

  const avatar = userData?.avatarUrl || user?.photoURL || null;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column - Profile Card */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white rounded-[32px] p-8 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(19,27,46,0.02)] border border-[#bccabc]/15">
          <div className="relative mb-4">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-[6px] border-white shadow-md ${uploadingAvatar ? 'opacity-50' : ''}`}>
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#dae2fd] flex items-center justify-center text-[#006d38] text-4xl font-bold">
                  {formData.name.charAt(0) || "U"}
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-10 h-10 bg-[#006d38] rounded-full flex items-center justify-center text-white border-4 border-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              {uploadingAvatar ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Camera size={16} />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
          
          <h2 className="text-xl font-bold text-[#131b2e] font-display">{formData.name}</h2>
          
          {user?.emailVerified ? (
            <div className="bg-[#006d38] text-white text-[10px] font-bold px-4 py-1.5 rounded-full mt-2 inline-flex items-center gap-1.5 shadow-sm tracking-wider">
              <div className="w-1.5 h-1.5 bg-[#dae2fd] rounded-full animate-pulse"></div>
              VERIFIED {userData?.role?.toUpperCase() || 'UMKM'}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-red-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full mt-2 inline-flex items-center gap-1.5 shadow-sm tracking-wider">
                <div className="w-1.5 h-1.5 bg-red-200 rounded-full animate-pulse"></div>
                UNVERIFIED {userData?.role?.toUpperCase() || 'UMKM'}
              </div>
              {!verificationSent ? (
                <button 
                  onClick={handleResendVerification}
                  className="mt-3 text-xs text-red-600 font-semibold hover:underline cursor-pointer"
                >
                  Resend Verification Email
                </button>
              ) : (
                <span className="mt-3 text-xs text-[#006d38] font-semibold">Verification email sent!</span>
              )}
            </div>
          )}

          <p className="text-sm text-[#3d4a3f] mt-6 leading-relaxed">
            {formData.bio || "Focused on helping local businesses grow through digital transformation and strategic planning."}
          </p>
        </div>

        <div className="bg-[#f2f3ff] rounded-[32px] p-8 border border-[#bccabc]/15 shadow-inner">
          <h3 className="font-bold text-sm text-[#131b2e] mb-4">Skill Tags</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="bg-white px-3 py-1.5 rounded-[16px] text-xs font-semibold text-[#131b2e] shadow-sm border border-[#bccabc]/15 flex items-center gap-1.5 group">
                {skill}
                {isEditing && (
                  <button onClick={() => handleRemoveSkill(skill)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
            
            {isEditing && (
              addingSkill ? (
                <div className="flex items-center bg-white rounded-[16px] border border-[#006d38] shadow-sm overflow-hidden">
                  <input 
                    type="text" 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                    autoFocus
                    className="px-3 py-1.5 text-xs text-[#131b2e] outline-none w-24 bg-transparent"
                    placeholder="New skill..."
                  />
                  <button onClick={handleAddSkill} className="bg-[#006d38] text-white px-2 py-1.5 hover:bg-green-700 cursor-pointer text-xs font-bold transition-colors">Add</button>
                </div>
              ) : (
                <button onClick={() => setAddingSkill(true)} className="bg-[#dae2fd] text-[#006d38] px-3 py-1.5 rounded-[16px] text-xs font-bold flex items-center gap-1 hover:bg-[#c2d0f9] transition-colors cursor-pointer shadow-sm">
                  <Plus size={12} /> Add Skill
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgba(19,27,46,0.02)] border border-[#bccabc]/15">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-[#131b2e] font-display">Personal Details</h2>
              <p className="text-sm text-[#3d4a3f] mt-1">Update your public profile and contact information.</p>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-[#006d38] text-sm font-bold flex items-center gap-2 hover:bg-[#f2f3ff] px-4 py-2 rounded-[16px] transition-colors cursor-pointer"
            >
              <Pencil size={14} />
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#3d4a3f] mb-2 tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                disabled={!isEditing}
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-3.5 rounded-[16px] text-sm text-[#131b2e] focus:outline-none transition-colors ${
                  isEditing ? "bg-white border border-[#006d38] shadow-[0_0_8px_rgba(0,109,56,0.1)]" : "bg-[#f2f3ff] border border-transparent"
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#3d4a3f] mb-2 tracking-wider">Email Address</label>
              <input
                type="email"
                disabled={true}
                value={user?.email || ""}
                className="w-full p-3.5 rounded-[16px] text-sm text-[#131b2e] bg-[#f2f3ff] border border-transparent focus:outline-none opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#3d4a3f] mb-2 tracking-wider">Nomor Telepon</label>
              <input
                type="tel"
                name="phone"
                disabled={!isEditing}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+62 812 3456 7890"
                className={`w-full p-3.5 rounded-[16px] text-sm text-[#131b2e] focus:outline-none transition-colors ${
                  isEditing ? "bg-white border border-[#006d38] shadow-[0_0_8px_rgba(0,109,56,0.1)]" : "bg-[#f2f3ff] border border-transparent"
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#3d4a3f] mb-2 tracking-wider">Lokasi</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  disabled={!isEditing}
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full p-3.5 pr-10 rounded-[16px] text-sm text-[#131b2e] focus:outline-none transition-colors ${
                    isEditing ? "bg-white border border-[#006d38] shadow-[0_0_8px_rgba(0,109,56,0.1)]" : "bg-[#f2f3ff] border border-transparent"
                  }`}
                />
                <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3f]" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-[#3d4a3f] mb-2 tracking-wider">Bio Profile</label>
              <textarea
                name="bio"
                disabled={!isEditing}
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Entrepreneur and business consultant with over 10 years of experience..."
                className={`w-full p-4 rounded-[16px] text-sm text-[#131b2e] focus:outline-none resize-none transition-colors ${
                  isEditing ? "bg-white border border-[#006d38] shadow-[0_0_8px_rgba(0,109,56,0.1)]" : "bg-[#f2f3ff] border border-transparent"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Stats Box */}
        <div className="bg-[#dae2fd] rounded-[32px] p-8 relative overflow-hidden text-[#131b2e] border border-[#bccabc]/15 shadow-inner">
          <div className="relative z-10">
            <h3 className="text-[#006d38] font-bold mb-1 text-lg">Member Status</h3>
            <p className="text-sm text-[#3d4a3f] mb-8 font-medium">Sejak 12 Maret 2021</p>
            
            <div className="flex gap-16">
              <div>
                <div className="text-4xl font-bold font-display">152</div>
                <div className="text-[10px] uppercase font-bold text-[#3d4a3f] mt-2 tracking-wider">Projects Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold font-display">4.9<span className="text-xl text-[#3d4a3f]/50">/5.0</span></div>
                <div className="text-[10px] uppercase font-bold text-[#3d4a3f] mt-2 tracking-wider">Client Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex justify-end items-center gap-4 mt-2">
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
              className="text-[#3d4a3f] font-semibold px-6 py-3.5 hover:bg-[#f2f3ff] rounded-[16px] transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-gradient-to-br from-[#006d38] to-[#00aa5b] text-white font-semibold px-8 py-3.5 rounded-[16px] hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(19,27,46,0.05)] disabled:opacity-70 flex items-center gap-2 cursor-pointer"
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              Save Profile Information
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
