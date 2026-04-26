"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';

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
      // Parse budget string (e.g. "Rp 450.000") to number
      const budgetNum = parseInt(project.budget.replace(/[^0-9]/g, ''), 10);
      if (selectedBudget === '< Rp 500k' && budgetNum >= 500000) match = false;
      if (selectedBudget === 'Rp 500k - 1M' && (budgetNum < 500000 || budgetNum > 1000000)) match = false;
      if (selectedBudget === 'Rp 1M - 5M' && (budgetNum <= 1000000 || budgetNum > 5000000)) match = false;
      if (selectedBudget === '> Rp 5M' && budgetNum <= 5000000) match = false;
    }
    return match;
  });

  return (
    <div className="bg-[#f8f9fe] flex flex-col font-sans text-gray-900 w-full h-full flex-1">
      <main className="flex-grow pt-24 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Filters */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          <div className="bg-[#f0f2ff] rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Filters</h2>
            
            <div className="mb-8">
              <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Category</h3>
              <div className="space-y-3">
                {['Design & Creative', 'Tech & Dev', 'Marketing'].map(category => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedCategory === category ? 'border-[#008f4c]' : 'border-gray-300 group-hover:border-[#008f4c]'}`}>
                      {selectedCategory === category && <div className="w-2.5 h-2.5 rounded-full bg-[#008f4c]" />}
                    </div>
                    <span className={`text-sm ${selectedCategory === category ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Budget Range</h3>
              <div className="flex flex-wrap gap-2">
                {['< Rp 500k', 'Rp 500k - 1M', 'Rp 1M - 5M', '> Rp 5M'].map(budgetRange => (
                  <button 
                    key={budgetRange}
                    onClick={() => setSelectedBudget(selectedBudget === budgetRange ? null : budgetRange)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      selectedBudget === budgetRange ? 'bg-[#008f4c] text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-600 hover:border-[#008f4c]'
                    }`}
                  >
                    {budgetRange}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Skill Level</h3>
              <div className="flex flex-wrap gap-2">
                {['Beginner', 'Intermediate', 'Expert'].map(skill => (
                  <button 
                    key={skill}
                    onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors shadow-sm ${
                      selectedSkill === skill ? 'bg-[#008f4c] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-[#008f4c]'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#1e2336] to-[#0f111a] rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="inline-block bg-[#00ff88] text-[#006d38] text-[10px] font-bold px-2 py-1 rounded mb-4 uppercase tracking-wider">
                PRO TIP
              </div>
              <h3 className="text-lg font-bold mb-2">Tingkatkan Profil Anda</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Lengkapi portofolio untuk mendapatkan 2x lebih banyak undangan proyek.
              </p>
              <button className="w-full bg-white text-gray-900 font-semibold py-3 rounded-full text-sm hover:bg-gray-100 transition-colors">
                Perbarui Profil
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Project List */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Proyek Terbaru</h1>
            <button className="flex items-center gap-2 bg-[#f0f2ff] px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-[#e4e7ff] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
              Terbaru
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-[#008f4c] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium">Belum ada proyek yang sesuai dengan filter.</p>
              </div>
            ) : (
              filteredProjects.map(project => (
                <div key={project.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(19,27,46,0.03)] border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {project.tags?.map((tag: any, i: number) => (
                          <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${
                            tag.type === 'category' ? 'bg-[#ebf0ff] text-[#4a72ff]' :
                            tag.type === 'verified' ? 'bg-[#dcfce7] text-[#16a34a]' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {tag.type === 'verified' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            {tag.type === 'rating' && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>}
                            {tag.label}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">{project.title}</h2>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-6 md:gap-12">
                        <div>
                          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Budget</p>
                          <p className="font-bold text-gray-900">{project.budget}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Skill Level</p>
                          <p className="font-semibold text-gray-700">{project.skill || 'Intermediate'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Waktu</p>
                          <p className="font-semibold text-gray-700">
                            {project.createdAt?.toDate ? formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true }) : 'Baru saja'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 mt-4 md:mt-0 self-start md:self-auto">
                      <Link href={`/marketplace/${project.id}`}>
                        <button className="bg-[#008f4c] text-white font-semibold py-3 px-8 rounded-full shadow-[0_4px_14px_rgba(0,143,76,0.3)] hover:bg-[#007a41] transition-all hover:-translate-y-0.5 active:translate-y-0">
                          Apply
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button className="bg-[#f8f9fe] border border-gray-200 text-[#008f4c] font-semibold py-3 px-8 rounded-full hover:bg-white hover:shadow-sm transition-all">
              Muat Proyek Lainnya
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
