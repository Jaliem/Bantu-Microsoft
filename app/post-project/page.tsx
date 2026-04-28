"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, PenTool, Code, Megaphone, CheckCircle2, ShieldCheck, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function PostProjectPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("You must be logged in to post a project.");
        router.push("/login");
      } else if (userData?.role === 'Mahasiswa') {
        toast.error("Students cannot post projects.");
        router.push("/dashboard");
      }
    }
  }, [user, userData, loading, router]);

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
      setStep(2);
      toast.success("SOP generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate SOP. Make sure you have GEMINI_API_KEY set in .env.local.");
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

      toast.success("Project Posted successfully!");
      router.push("/marketplace");
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Failed to publish project.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-[#f8f9fe] flex flex-col font-sans text-gray-900 w-full h-full flex-1">
      <main className="flex-grow pt-24 pb-16 px-6 max-w-5xl mx-auto w-full">
        
        <div className="mb-10">
          <div className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#16a34a] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            <CheckCircle2 size={12} /> PREMIUM UMKM FLOW
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#111827] mb-4">
            Post a Project
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Let's find the best Indonesian talent for your business. Provide the details below to attract top-tier professionals.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Progress */}
          <div className="w-full lg:w-48 shrink-0 flex flex-col gap-8">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {['Basics', 'Description', 'Budget'].map((item, idx) => {
                const stepNum = idx + 1;
                const isActive = step === stepNum;
                const isPast = step > stepNum;
                return (
                  <div key={item} className="relative flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${
                      isActive || isPast ? 'bg-[#008f4c] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-200'
                    }`}>
                      {isPast ? <CheckCircle2 size={16} /> : stepNum}
                    </div>
                    <span className={`font-semibold ${isActive ? 'text-[#008f4c]' : 'text-gray-400'}`}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#f0f2ff] rounded-[24px] p-6 mt-8">
              <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">COMPLETION</h4>
              <div className="w-full h-2 bg-[#dce1ff] rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-[#008f4c] transition-all duration-500" style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }} />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Step {step} of 3: {step === 1 ? 'Define your vision' : step === 2 ? 'Detail the work' : 'Set the reward'}
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Main Form Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
              
              {step === 1 && (
                <>
                  <div className="mb-8">
                    <label className="block text-xs font-bold tracking-widest text-gray-900 uppercase mb-3">
                      PROJECT TITLE
                    </label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Logo Design for Organic Coffee Brand"
                      className="w-full bg-[#f8f9fe] border-none rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#008f4c] transition-all outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-3 font-medium">
                      Keep it concise. Mention the industry and specific output.
                    </p>
                  </div>

                  <div className="mb-10">
                    <label className="block text-xs font-bold tracking-widest text-gray-900 uppercase mb-3">
                      SELECT CATEGORY
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'Design & Creative', icon: <PenTool size={18} /> },
                        { id: 'Tech & Dev', icon: <Code size={18} /> },
                        { id: 'Marketing', icon: <Megaphone size={18} /> }
                      ].map(cat => (
                        <div 
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`cursor-pointer rounded-2xl p-4 flex flex-col gap-3 transition-all ${
                            category === cat.id 
                              ? 'bg-[#008f4c] text-white shadow-lg scale-[1.02]' 
                              : 'bg-[#f8f9fe] text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className={category === cat.id ? 'text-white' : 'text-[#008f4c]'}>
                            {cat.icon}
                          </div>
                          <span className="font-semibold text-sm">{cat.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-10">
                    <label className="block text-xs font-bold tracking-widest text-gray-900 uppercase mb-3">
                      SKILL LEVEL REQUIRED
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {['Beginner', 'Intermediate', 'Expert'].map(level => (
                        <div 
                          key={level}
                          onClick={() => setSkill(level)}
                          className={`cursor-pointer rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all text-center ${
                            skill === level 
                              ? 'bg-[#008f4c] text-white shadow-lg scale-[1.02]' 
                              : 'bg-[#f8f9fe] text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className="font-semibold text-sm">{level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Banner */}
                  <div className="bg-[#1e2336] rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    
                    <div className="relative z-10 max-w-md">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">Struggling with the brief?</h3>
                        <Sparkles className="text-[#00ff88]" size={20} />
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Our AI can draft a professional SOP and task requirement list based on your title.
                      </p>
                    </div>

                    <button 
                      onClick={handleGenerateSop}
                      disabled={isGenerating}
                      className="relative z-10 shrink-0 bg-[#00ff88] hover:bg-[#00e67a] text-[#006d38] font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                           <div className="w-4 h-4 border-2 border-[#006d38] border-t-transparent rounded-full animate-spin" />
                           Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> Generate SOP with AI
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="mb-8">
                  <label className="block text-xs font-bold tracking-widest text-gray-900 uppercase mb-3">
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
                    <div className="w-full h-80 bg-white border border-gray-100 rounded-2xl px-6 py-4 overflow-auto">
                      <div className="prose prose-brand max-w-none text-gray-700">
                        <ReactMarkdown>
                          {generatedSop || 'Nothing to preview yet.'}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <textarea 
                      value={generatedSop}
                      onChange={(e) => setGeneratedSop(e.target.value)}
                      placeholder="Describe your project, requirements, and deliverables here..."
                      className="w-full h-80 bg-[#f8f9fe] border-none rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#008f4c] transition-all outline-none resize-none leading-relaxed"
                    />
                  )}
                  
                  <div className="flex items-center gap-2 mt-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm">
                    <Sparkles size={16} className="text-blue-500 shrink-0" />
                    <span>You can freely edit the generated text before proceeding.</span>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mb-8">
                  <label className="block text-xs font-bold tracking-widest text-gray-900 uppercase mb-3">
                    PROJECT BUDGET
                  </label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                      Rp
                    </div>
                    <input 
                      type="text" 
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 500.000"
                      className="w-full bg-[#f8f9fe] border-none rounded-2xl pl-14 pr-6 py-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#008f4c] transition-all outline-none text-xl font-bold"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 font-medium">
                    Set a fair price for the task. Students can bid around this amount.
                  </p>
                </div>
              )}

              <div className="mt-10 flex justify-end items-center gap-4 pt-6 border-t border-gray-100">
                {step === 1 ? (
                  <>
                    <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors">
                      Save as Draft
                    </button>
                    <button 
                      onClick={() => setStep(2)}
                      className="bg-[#008f4c] hover:bg-[#007a41] text-white font-semibold py-3 px-8 rounded-full transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Next: Description
                    </button>
                  </>
                ) : step === 2 ? (
                  <>
                    <button 
                      onClick={() => setStep(1)}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="bg-[#008f4c] hover:bg-[#007a41] text-white font-semibold py-3 px-8 rounded-full transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)]"
                    >
                      Next: Budget
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setStep(2)}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => handlePublish()}
                      className="bg-[#008f4c] hover:bg-[#007a41] text-white font-semibold py-3 px-8 rounded-full transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)]"
                    >
                      Publish Project
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-[#f0f2ff] rounded-[24px] p-6 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <Lightbulb size={20} className="text-[#008f4c]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1">Writing Tip</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Be specific about the deliverables you expect by the end of the project.
                  </p>
                </div>
              </div>
              
              <div className="bg-[#f0f2ff] rounded-[24px] p-6 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck size={20} className="text-[#008f4c]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1">BANTU Guarantee</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your funds are held securely and only released when you approve the work.
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
