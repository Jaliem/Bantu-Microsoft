"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function MarketplacePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData: any[] = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() });
      });
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter(project => {
    let match = true;
    if (selectedCategory && project.category !== selectedCategory) {
      match = false;
    }
    if (selectedSkill && project.skill !== selectedSkill) {
      match = false;
    }
    if (selectedBudget && project.budget) {
      const budgetNum = parseInt(project.budget.replace(/[^0-9]/g, ''), 10);
      if (selectedBudget === '< Rp 500k' && budgetNum >= 500000) match = false;
      if (selectedBudget === 'Rp 500k - 1M' && (budgetNum < 500000 || budgetNum > 1000000)) match = false;
      if (selectedBudget === 'Rp 1M - 5M' && (budgetNum <= 1000000 || budgetNum > 5000000)) match = false;
      if (selectedBudget === '> Rp 5M' && budgetNum <= 5000000) match = false;
    }
    return match;
  });

  return (
    <div className="bg-brand-light flex flex-col font-sans text-brand-dark w-full min-h-screen">
      <main className="flex-grow pt-28 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-10">
        
        {/* Left Sidebar - Filters */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-8 lg:sticky lg:top-28 self-start">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-ambient border border-brand-dark/5">
            <div className="flex items-center gap-2 mb-8">
              <SlidersHorizontal size={18} className="text-brand-mid" />
              <h2 className="text-xl font-display font-bold text-brand-dark">Filters</h2>
            </div>
            
            <div className="mb-10">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-brand-dark/30 uppercase mb-5">Category</h3>
              <div className="space-y-4">
                {['Design & Creative', 'Tech & Dev', 'Marketing'].map(category => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}>
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedCategory === category ? 'border-brand-mid bg-brand-mid' : 'border-brand-dark/10 group-hover:border-brand-mid'}`}>
                      {selectedCategory === category && <div className="w-2 h-2 rounded-sm bg-white" />}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${selectedCategory === category ? 'text-brand-dark font-bold' : 'text-brand-dark/50 group-hover:text-brand-dark'}`}>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-brand-dark/30 uppercase mb-5">Budget Range</h3>
              <div className="flex flex-wrap gap-2">
                {['< Rp 500k', 'Rp 500k - 1M', 'Rp 1M - 5M', '> Rp 5M'].map(budgetRange => (
                  <button 
                    key={budgetRange}
                    onClick={() => setSelectedBudget(selectedBudget === budgetRange ? null : budgetRange)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedBudget === budgetRange ? 'bg-brand-mid text-white shadow-lg shadow-brand-mid/20' : 'bg-brand-light/50 text-brand-dark/50 hover:bg-brand-light hover:text-brand-dark'
                    }`}
                  >
                    {budgetRange}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-brand-dark/30 uppercase mb-5">Skill Level</h3>
              <div className="flex flex-wrap gap-2">
                {['Beginner', 'Intermediate', 'Expert'].map(skill => (
                  <button 
                    key={skill}
                    onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                      selectedSkill === skill ? 'bg-brand-dark text-white' : 'bg-brand-light/50 text-brand-dark/50 hover:bg-brand-light hover:text-brand-dark'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Project List */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-display font-semibold tracking-tight text-brand-dark">Marketplace</h1>
              <p className="text-brand-dark/40 text-sm mt-1">Temukan peluang terbaik untuk karir Anda.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20 w-4 h-4" />
                <input type="text" placeholder="Search tasks..." className="w-full bg-white border border-brand-dark/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-brand-mid/5 transition-all shadow-ambient" />
               </div>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-brand-mid border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] p-16 text-center border border-brand-dark/5 shadow-ambient">
                <p className="text-brand-dark/30 font-display font-bold uppercase tracking-widest text-sm">Belum ada proyek ditemukan</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredProjects.map((project, idx) => (
                  <motion.div 
                    key={project.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-ambient border border-brand-dark/5 hover:border-brand-mid/20 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                          <span className="bg-brand-mid/10 text-brand-mid text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em]">
                            {project.category}
                          </span>
                          <span className="bg-brand-dark/5 text-brand-dark/40 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] flex items-center gap-1.5">
                            <CheckCircle2 size={10} /> Verified UMKM
                          </span>
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 text-brand-dark group-hover:text-brand-mid transition-colors">
                          {project.title}
                        </h2>
                        
                        <div className="text-brand-dark/50 text-base leading-relaxed mb-8 line-clamp-2 font-light prose-sm prose-brand">
                          <ReactMarkdown>
                            {project.description}
                          </ReactMarkdown>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-8 md:gap-12 pt-8 border-t border-brand-dark/5">
                          <div>
                            <p className="text-[9px] font-bold tracking-[0.2em] text-brand-dark/20 uppercase mb-2">Budget</p>
                            <p className="font-display font-bold text-brand-dark">{project.budget}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold tracking-[0.2em] text-brand-dark/20 uppercase mb-2">Skill Level</p>
                            <p className="font-display font-bold text-brand-dark/60">{project.skill || 'Intermediate'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold tracking-[0.2em] text-brand-dark/20 uppercase mb-2">Posted</p>
                            <p className="font-display font-bold text-brand-dark/60">
                              {project.createdAt?.toDate ? formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true }) : 'Baru saja'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="shrink-0 mt-2 md:mt-0 flex flex-row md:flex-col gap-4">
                        <Link href={`/marketplace/${project.id}`} className="flex-1 md:flex-none">
                          <button className="w-full bg-brand-dark text-white font-display font-bold py-4 px-10 rounded-full text-[10px] uppercase tracking-widest hover:bg-brand-mid transition-all active:scale-95 shadow-xl shadow-brand-dark/10 group-hover:shadow-brand-mid/20">
                            View Task
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="bg-white border border-brand-dark/5 text-brand-dark/40 font-display font-bold py-4 px-12 rounded-full text-[10px] uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all shadow-ambient active:scale-95">
              Muat Proyek Lainnya
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
