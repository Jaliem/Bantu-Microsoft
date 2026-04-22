"use client";

import { motion } from "framer-motion";
import { LaptopMockup } from "../ui/LaptopMockup";
import { mockups } from "@/lib/mockups";

export function Solution() {
  return (
    <section className="py-32 bg-brand-mid text-brand-light overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-black/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-sm font-semibold tracking-[0.24em] uppercase text-brand-light/80 mb-5"
          >
            Mengapa BANTU Bekerja
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2.4rem,5vw,4.75rem)] font-semibold tracking-[-0.035em] leading-[1.02] font-display mb-6 text-balance text-brand-light"
          >
            Jembatan Itu Ada di Sini.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-brand-light/80 max-w-3xl mx-auto leading-relaxed text-balance"
          >
            BANTU adalah ekosistem di mana tugas mikro UMKM berubah menjadi portofolio mahasiswa. Cepat, andal, dan adil.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Using a custom styling for the laptop mockup inside the dark section */}
          <LaptopMockup
            label="Placeholder: BANTU Ecosystem Screen"
            image={mockups.ecosystem}
            tilt="none"
            className="border-brand-dark/10 bg-white"
          />
        </motion.div>
      </div>
    </section>
  );
}
