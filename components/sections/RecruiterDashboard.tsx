"use client";

import { motion } from "framer-motion";
import { LaptopMockup } from "../ui/LaptopMockup";
import { mockups } from "@/lib/mockups";
import { CheckCircle2 } from "lucide-react";

export function RecruiterDashboard() {
  return (
    <section className="py-32 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[clamp(2.2rem,4.2vw,4.2rem)] font-semibold tracking-[-0.03em] leading-[1.05] font-display mb-6 text-balance">
              Hire with Confidence
            </h2>
            <p className="text-lg md:text-2xl text-primary-foreground/80 mb-10 leading-relaxed max-w-2xl text-balance">
              For recruiters and HR professionals, BANTU provides a verified talent pool. No more guessing if a student&apos;s CV is padded. Every skill is backed by real-world micro-tasks and verified by AI and MSMEs.
            </p>
            
            <ul className="space-y-4 mb-10">
              {[
                "Search by verified skills, not just degrees",
                "View proof-of-action timelines for past tasks",
                "Directly message top-ranked students",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                  <span className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <LaptopMockup
              label="Placeholder: Recruiter Dashboard"
              image={mockups.recruiter}
              tilt="left"
              className="border-primary-foreground/20 bg-primary-foreground/5 w-full max-w-none"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
