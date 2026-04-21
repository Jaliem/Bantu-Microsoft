"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";

const popularServices = [
  { title: "Vibe Coding", color: "bg-[#006d38]" },
  { title: "Website Development", color: "bg-[#006d38]" },
  { title: "Video Editing", color: "bg-[#006d38]" },
  { title: "Software Development", color: "bg-[#006d38]" },
  { title: "Book Publishing", color: "bg-[#006d38]" },
  { title: "Architecture & Interior Design", color: "bg-[#006d38]" },
];

export function Hero() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 bg-[#faf8ff]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl">
        {/* Main Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-4xl overflow-hidden bg-[#006d38] text-[#ffffff] shadow-[0_8px_30px_rgba(19,27,46,0.15)] h-150 flex items-center"
        >
          {/* Background Image Placeholder */}
          <div
            className="absolute inset-0 transition-transform duration-[2s] hover:scale-105 pointer-events-none"
            style={{
              backgroundImage: "url('/images/hero-background.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.4,
            }}
          />

          <div className="relative z-10 px-8 sm:px-16 md:px-24 w-full md:w-3/4 lg:w-2/3">
            <h1 className="text-[clamp(2.5rem,6vw,5.25rem)] font-semibold tracking-[-0.04em] font-sans mb-6 leading-[0.98] text-balance">
              Hire the experts your business needs
            </h1>

            <p className="text-lg md:text-2xl text-[#d4dbd6] mb-10 max-w-2xl font-sans leading-relaxed text-balance">
              Access skilled freelancers ready to help you build and scale — without the full-time commitment
            </p>

            {/* Toggle: Hire vs Work */}
            <div className="flex bg-[#2a352c]/50 backdrop-blur-md rounded-full p-1 w-fit mb-6 shadow-inner border border-white/5">
              <button className="px-6 py-2 rounded-full bg-[#3d4a3f]/70 text-[#ffffff] font-medium text-sm transition-all shadow-sm">
                I want to hire
              </button>
              <button className="px-6 py-2 rounded-full text-[#d4dbd6] hover:bg-[#3d4a3f]/30 font-medium text-sm transition-all">
                I want to work
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl group flex items-center bg-[#ffffff] rounded-2xl p-2 pl-6 focus-within:ring-2 focus-within:ring-[#006d38] transition-all shadow-[0_4px_20px_rgba(19,27,46,0.1)]">
              <input
                type="text"
                placeholder="Search for any service..."
                className="w-full bg-transparent border-none outline-none text-[#131b2e] placeholder:text-[#839587] font-sans text-base leading-none"
              />
              <button className="shrink-0 h-10 px-6 rounded-xl bg-[#006d38] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group-hover:shadow-[0_2px_15px_rgba(0,109,56,0.3)]">
                <Search className="w-5 h-5 text-[#ffffff]" />
                <span className="text-[#ffffff] font-medium hidden sm:block">Search</span>
              </button>
            </div>

            {/* Suggestion Pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['Web design', 'AI development', 'Video editing', 'Google Ads'].map((tag) => (
                <button
                  key={tag}
                  className="px-4 py-1.5 rounded-full border border-white/20 text-[#ffffff] text-sm font-semibold tracking-wide hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  {tag}
                  <ArrowRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Popular Services Carousel */}
        <div className="mt-20 sm:mt-24 mb-12 relative group">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-tight text-[#131b2e] font-sans text-balance">
              Popular services
            </h2>
            <div className="hidden sm:flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ffffff] shadow-[0_4px_20px_rgba(19,27,46,0.05)] border border-[#bccabc]/15 hover:bg-[#f2f3ff] transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-[#131b2e]" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ffffff] shadow-[0_4px_20px_rgba(19,27,46,0.05)] border border-[#bccabc]/15 hover:bg-[#f2f3ff] transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-[#131b2e]" />
              </button>
            </div>
          </div>
          
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {popularServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`shrink-0 w-60 sm:w-70 h-80 rounded-3xl p-1 flex flex-col snap-start cursor-pointer border border-[#bccabc]/15 hover:-translate-y-2 transition-transform duration-300 shadow-[0_4px_20px_rgba(19,27,46,0.05)] ${service.color}`}
              >
                <div className="p-5 flex-1">
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#ffffff] font-sans leading-tight text-balance">
                    {service.title}
                  </h3>
                </div>
                {/* Bottom Image Area (Placeholder) */}
                <div className="h-48 w-full bg-[#ffffff] rounded-[1.2rem] mt-auto overflow-hidden relative">
                  {/* Decorative Elements replacing actual images */}
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                     <span className="font-sans font-bold text-xl text-[#3d4a3f]">BANTU</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
