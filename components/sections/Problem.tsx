"use client";

import { motion } from "framer-motion";
import { XCircle, CheckCircle2 } from "lucide-react";

export function Problem() {
  return (
    <section className="py-32 bg-[#006d38] overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-semibold tracking-[-0.035em] leading-tight text-[#ffffff] font-sans mb-6 text-balance"
          >
            Maximize Your Impact
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-[#ffffff]/85 font-sans leading-relaxed text-balance"
          >
            Acquiring experience shouldn't be a catch-22, and growing a business shouldn't drain your budget.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto relative mt-20">
          <div className="grid md:grid-cols-2 gap-8 relative items-stretch">
            
            {/* Old Way */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <h3 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] mb-6 text-[#ffffff] font-sans">Old Way</h3>
              <div className="bg-[#ffffff] rounded-3xl p-8 md:p-10 shadow-[0_4px_20px_rgba(19,27,46,0.05)] border-none ring-1 ring-[#bccabc]/15 flex items-start gap-4 h-full w-full">
                <XCircle className="w-8 h-8 text-[#dc2626] shrink-0 mt-1" />
                <p className="text-xl text-[#3d4a3f] leading-[1.65] font-sans">
                  Struggle with <strong className="text-[#006d38] font-bold">empty CVs</strong>, unstructured internships, and <strong className="text-[#006d38] font-bold">expensive full-time hires</strong> or agencies for simple micro-tasks.
                </p>
              </div>
            </motion.div>

            {/* VS Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-10 md:mt-6 z-10 hidden md:flex">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-16 h-16 rounded-full bg-[#131b2e] flex items-center justify-center text-[#ffffff] font-bold text-xl border-[6px] border-[#f2f3ff] shadow-[0_4px_20px_rgba(19,27,46,0.05)]"
              >
                VS
              </motion.div>
            </div>

            {/* BANTU Way */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <h3 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] mb-6 text-[#ffffff] font-sans">BANTU Way</h3>
              <div className="bg-[#ffffff] rounded-3xl p-8 md:p-10 shadow-[0_4px_20px_rgba(19,27,46,0.05)] border-none ring-1 ring-[#bccabc]/15 flex items-start gap-4 h-full w-full">
                <CheckCircle2 className="w-8 h-8 text-[#006d38] shrink-0 mt-1" />
                <p className="text-xl text-[#3d4a3f] leading-[1.65] font-sans">
                  Use <strong className="text-[#006d38] font-bold">1 platform</strong> to post micro-tasks, automate SOPs with AI, and build verified portfolios through secure escrow payments.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
