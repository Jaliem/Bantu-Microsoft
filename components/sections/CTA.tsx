"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LaptopMockup } from "../ui/LaptopMockup";
import { mockups } from "@/lib/mockups";

export function CTA() {
  return (
    <section className="py-32 bg-background text-foreground overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-sm font-semibold tracking-[0.24em] uppercase text-primary mb-4"
          >
            Start Today
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2.8rem,6vw,5.75rem)] font-semibold tracking-[-0.04em] leading-[0.98] font-display mb-8 text-balance"
          >
            Ready to Bridge the Gap?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed text-balance"
          >
            Join thousands of students building their careers, and MSMEs accelerating their growth with BANTU.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
          >
            <button className="h-14 px-8 rounded-full bg-accent text-accent-foreground font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors w-full sm:w-auto text-lg">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="h-14 px-8 rounded-full bg-transparent border border-border/70 text-foreground font-semibold tracking-wide flex items-center justify-center hover:bg-muted/40 transition-colors w-full sm:w-auto text-lg">
              Book a Demo
            </button>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <LaptopMockup
              label="Placeholder: Final Product Mockup"
              image={mockups.finalProduct}
              tilt="none"
              className="border-border/60 bg-muted/40 shadow-2xl shadow-black/10"
            />
          </motion.div> */}
        </div>
      </div>
    </section>
  );
}
