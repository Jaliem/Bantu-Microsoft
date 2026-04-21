"use client";

import { motion } from "framer-motion";
import { LaptopMockup } from "../ui/LaptopMockup";
import { mockups } from "@/lib/mockups";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Bounty Marketplace",
    desc: "A centralized hub where MSMEs post micro-tasks and students browse opportunities that fit their skill sets and schedules.",
    label: "Placeholder: Marketplace Screen",
    image: mockups.marketplace,
  },
  {
    title: "Smart Escrow Payment",
    desc: "Funds are locked upfront and released only when the task is approved. Guaranteed payment for students, guaranteed work for MSMEs.",
    label: "Placeholder: Escrow Payment Screen",
    image: mockups.escrow,
  },
  {
    title: "Verified Rank System",
    desc: "Students build reputation through successful tasks. Higher ranks unlock better-paying bounties and exclusive opportunities.",
    label: "Placeholder: Student Rank Screen",
    image: mockups.studentRank,
  },
  {
    title: "Instant Portfolio Builder",
    desc: "Every completed task automatically generates a verified portfolio entry, complete with MSME reviews and project metrics.",
    label: "Placeholder: Portfolio Builder Screen",
    image: mockups.portfolioBuilder,
  },
  {
    title: "Live Ledger / Task History",
    desc: "Complete transparency for both parties. Track task progress, payment history, and dispute resolutions in one unified ledger.",
    label: "Placeholder: Task History Screen",
    image: mockups.taskHistory,
  },
];

export function CoreFeatures() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-[clamp(2.4rem,4.5vw,4.4rem)] font-semibold tracking-[-0.03em] leading-[1.05] text-primary font-display mb-6 text-balance">
            Core Features
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance">
            Everything you need to manage micro-tasks securely and build a verifiable portfolio.
          </p>
        </div>

        <div className="flex flex-col gap-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col gap-12 lg:gap-20 items-center",
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                )}
              >
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <h3 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-6 font-display text-primary text-balance">
                      {feature.title}
                    </h3>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl text-balance">
                      {feature.desc}
                    </p>
                  </motion.div>
                </div>
                
                <div className="w-full lg:w-1/2">
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <LaptopMockup
                      label={feature.label}
                      image={feature.image}
                      tilt={isEven ? "left" : "right"}
                    />
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
