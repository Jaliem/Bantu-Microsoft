"use client";

import React, { useState, useEffect } from 'react';
import {PenTool, Code, Megaphone, CheckCircle2, ShieldCheck, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostProjectPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error("You must be logged in to post a project.");
        router.push("/login");
      } else if (userData?.role === 'Mahasiswa') {
        toast.error("Students cannot post projects.");
        router.push("/dashboard");
      }
    }
  }, [user, userData, authLoading, router]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Design & Creative');
  const [skill, setSkill] = useState('Intermediate');
  const [budget, setBudget] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSop, setGeneratedSop] = useState('');
  const [showSopPreview, setShowSopPreview] = useState(false);
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleGenerateSop = async () => {
    if (!title) {
      toast.error("Please enter a project title first!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category }),
      });
      
      if (!response.ok) throw new Error("Failed to generate");
      
      const data = await response.json();
      setGeneratedSop(data.sop);
      toast.success("SOP generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate SOP.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error("You must be logged in to post a project.");
      return;
    }
    
    if (!budget) {
      toast.error("Please enter a budget.");
      return;
    }

    setIsPublishing(true);
    try {
      await addDoc(collection(db, "projects"), {
        title,
        category,
        skill,
        budget: `Rp ${budget}`,
        description: generatedSop,
        umkmId: user.uid,
        createdAt: serverTimestamp(),
        tags: [
          { label: category, type: 'category' }
        ]
      });

      toast.success("Project Published!");
      router.push("/marketplace");
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Failed to publish project.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="bg-brand-light min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-brand-light font-sans text-brand-dark min-h-screen pt-28 pb-20 px-6">
      <main className="max-w-6xl mx-auto w-full">
        
        <div className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold tracking-tight text-brand-dark mb-4"
          >
            Post a Project
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-brand-dark/40 text-lg max-w-2xl font-sans font-light"
          >
            Temukan talenta mahasiswa terbaik untuk bisnis Anda. Berikan detail proyek untuk menarik profesional berkualitas.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Progress */}
          <div className="w-full lg:w-56 shrink-0">
            <div className="space-y-8 relative sticky top-32">
              {['Basics', 'Description', 'Budget'].map((item, idx) => {
                const stepNum = idx + 1;
                const isActive = step === stepNum;
                const isPast = step > stepNum;
                return (
                  <div key={item} className="relative flex items-center gap-5 group">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black z-10 transition-all duration-500 ${
                      isActive ? 'bg-brand-mid text-white shadow-lg shadow-brand-mid/30 scale-110' : 
                      isPast ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark/20 border border-brand-dark/5 shadow-sm'
                    }`}>
                      {isPast ? <CheckCircle2 size={18} /> : `0${stepNum}`}
                    </div>
                    <span className={`font-display font-bold text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-brand-mid' : 'text-brand-dark/30'}`}>
                      {item}
                    </span>
                    {idx < 2 && (
                      <div className="absolute left-5 top-10 w-px h-8 bg-brand-dark/5" />
                    )}
                  </div>
                );
              })}

              <div className="bg-white rounded-3xl p-6 mt-12 shadow-ambient border border-brand-dark/5">
                <h4 className="text-[9px] font-bold tracking-[0.2em] text-brand-dark/20 uppercase mb-4">Completion</h4>
                <div className="w-full h-1.5 bg-brand-light rounded-full mb-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
                    className="h-full bg-brand-mid shadow-[0_0_10px_rgba(0,109,56,0.3)]" 
                  />
                </div>
                <p className="text-[10px] text-brand-dark/40 font-bold uppercase tracking-wider">
                  Step {step} of 3
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex-1 flex flex-col gap-8">
            
            <motion.div 
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-ambient border border-brand-dark/5"
            >
              
              {step === 1 && (
                <div className="space-y-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-dark/30 ml-1">Project Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Logo Design for Organic Coffee Brand"
                      className="w-full bg-brand-light/50 border-2 border-transparent rounded-2xl px-8 py-5 text-brand-dark placeholder:text-brand-dark/20 focus:bg-white focus:border-brand-mid focus:ring-4 focus:ring-brand-mid/5 transition-all outline-none font-display font-bold text-lg"
                    />
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-dark/30 ml-1">Select Category</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'Design & Creative', icon: <PenTool size={20} /> },
                        { id: 'Tech & Dev', icon: <Code size={20} /> },
                        { id: 'Marketing', icon: <Megaphone size={20} /> }
                      ].map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`rounded-2xl p-6 flex flex-col items-start gap-4 transition-all text-left cursor-pointer border-2 ${
                            category === cat.id 
                              ? 'bg-brand-mid border-brand-mid text-white shadow-xl shadow-brand-mid/20' 
                              : 'bg-brand-light/30 border-transparent text-brand-dark/40 hover:bg-brand-light'
                          }`}
                        >
                          <div className={category === cat.id ? 'text-white' : 'text-brand-mid'}>
                            {cat.icon}
                          </div>
                          <span className="font-display font-bold text-[11px] uppercase tracking-widest">{cat.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-dark/30 ml-1">Required Expertise</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['Beginner', 'Intermediate', 'Expert'].map(level => (
                        <button 
                          key={level}
                          onClick={() => setSkill(level)}
                          className={`rounded-2xl py-5 font-display font-bold text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer border-2 ${
                            skill === level 
                              ? 'bg-brand-dark border-brand-dark text-white shadow-xl' 
                              : 'bg-brand-light/30 border-transparent text-brand-dark/40 hover:bg-brand-light'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="mb-8 space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold tracking-widest text-gray-900 uppercase mb-3 ml-1">
                      PROJECT DESCRIPTION & SOP
                    </label>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400 font-semibold">Markdown supported</span>
                      <div className="inline-flex rounded-full bg-[#f1f5f9] p-1">
                        <button
                          type="button"
                          onClick={() => setShowSopPreview(false)}
                          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                            showSopPreview ? 'text-gray-500 hover:text-gray-700' : 'bg-white text-gray-900 shadow-sm'
                          }`}
                        >
                          Write
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSopPreview(true)}
                          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                            showSopPreview ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Preview
                        </button>
                      </div>
                    </div>

                    {showSopPreview ? (
                      <div className="w-full h-80 bg-white border border-gray-100 rounded-2xl px-6 py-4 overflow-auto" data-lenis-prevent>
                        <div className="prose prose-brand max-w-none text-gray-700">
                          <ReactMarkdown>
                            {generatedSop || 'Nothing to preview yet.'}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <textarea 
                        data-lenis-prevent
                        value={generatedSop}
                        onChange={(e) => setGeneratedSop(e.target.value)}
                        placeholder="Describe your project, requirements, and deliverables here..."
                        className="w-full h-80 bg-[#f8f9fe] border-none rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#008f4c] transition-all outline-none resize-none leading-relaxed"
                      />
                    )}
                    
                    <div className="flex items-center gap-4 bg-brand-mid/5 text-brand-mid px-6 py-4 rounded-2xl border border-brand-mid/10">
                      <p className="text-[11px] font-bold uppercase tracking-wider">You can freely edit the generated text before proceeding.</p>
                    </div>
                  </div>

                  <div className="bg-brand-dark rounded-[2rem] p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-mid/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-display font-bold">Struggling with the brief?</h3>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-sm font-sans font-light">
                        Biarkan AI kami menyusun SOP dan daftar kebutuhan proyek secara profesional berdasarkan judul Anda.
                      </p>
                      <button 
                        onClick={handleGenerateSop}
                        disabled={isGenerating}
                        className="bg-brand-mid hover:bg-white hover:text-brand-dark text-white font-display font-bold py-4 px-8 rounded-full text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-brand-mid/20 disabled:opacity-50 cursor-pointer"
                      >
                        {isGenerating ? "Generating..." : "Generate SOP with AI"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-dark/30 ml-1">Set Project Budget</label>
                    <div className="relative group">
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-dark/30 font-display font-black text-2xl group-focus-within:text-brand-mid transition-colors">
                        Rp
                      </div>
                      <input 
                        type="text" 
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="500.000"
                        className="w-full bg-brand-light/50 border-2 border-transparent rounded-[2rem] pl-20 pr-8 py-8 text-brand-dark placeholder:text-brand-dark/20 focus:bg-white focus:border-brand-mid focus:ring-4 focus:ring-brand-mid/5 transition-all outline-none font-display font-black text-4xl tracking-tighter"
                      />
                    </div>
                    <p className="text-[11px] text-brand-dark/40 font-sans leading-relaxed px-2">
                      Berikan harga yang adil. Mahasiswa akan melakukan bid di sekitar jumlah ini.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-16 flex justify-between items-center pt-10 border-t border-brand-dark/5">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(prev => prev - 1)}
                    className="flex items-center gap-2 text-brand-dark/40 font-display font-bold text-[10px] uppercase tracking-widest hover:text-brand-dark transition-colors"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
                <div className="flex items-center gap-4 ml-auto">
                  {step === 1 && (
                    <button className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-dark/20 hover:text-brand-dark transition-colors px-6">
                      Save Draft
                    </button>
                  )}
                  <button 
                    onClick={step === 3 ? handlePublish : () => setStep(prev => prev + 1)}
                    disabled={isPublishing}
                    className="bg-brand-mid hover:bg-brand-dark text-white font-display font-bold py-5 px-12 rounded-full text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-brand-mid/20 flex items-center gap-3 active:scale-95"
                  >
                    {isPublishing ? "Publishing..." : step === 3 ? "Publish Project" : "Next Step"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] p-8 border border-brand-dark/5 shadow-ambient flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center shrink-0 border border-brand-dark/5">
                  <Lightbulb size={24} className="text-brand-mid" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-brand-dark mb-1">Writing Tip</h4>
                  <p className="text-[11px] text-brand-dark/40 leading-relaxed font-sans font-light">
                    Be specific about the deliverables you expect by the end of the project.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-[2rem] p-8 border border-brand-dark/5 shadow-ambient flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center shrink-0 border border-brand-dark/5">
                  <ShieldCheck size={24} className="text-brand-mid" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-brand-dark mb-1">BANTU Guarantee</h4>
                  <p className="text-[11px] text-brand-dark/40 leading-relaxed font-sans font-light">
                    Dana Anda dipegang aman dan hanya dicairkan saat Anda menyetujui hasil kerja.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
