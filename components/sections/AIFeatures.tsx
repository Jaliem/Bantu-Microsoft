"use client";

import { motion } from "framer-motion";
import { LaptopMockup } from "../ui/LaptopMockup";
import { mockups } from "@/lib/mockups";

const aiFeatures = [
  {
    title: "AI-Bounty Scripter",
    desc: "Transforms vague MSME ideas into clear, structured standard operating procedures (SOPs).",
    label: "Placeholder: AI SOP Generator Screen",
    image: mockups.aiSop,
  },
  {
    title: "AI Quality Gate",
    desc: "Automatically checks submitted work against the generated SOP before it reaches the MSME.",
    label: "Placeholder: AI Quality Gate Screen",
    image: mockups.aiQuality,
  },
  {
    title: "Automated Matchmaking",
    desc: "Pairs the right student with the right task based on historical performance and skills.",
    label: "Placeholder: Matchmaking Screen",
    image: mockups.matchmaking,
  },
  {
    title: "Skill-Gap Bridge",
    desc: "Recommends micro-learning modules to students to help them qualify for higher-paying bounties.",
    label: "Placeholder: Learning Recommendation Screen",
    image: mockups.learningRecs,
  },
  {
    title: "Proof-of-Action Timeline",
    desc: "An AI-verified timeline of all actions taken during the task for ultimate dispute resolution.",
    label: "Placeholder: Timeline Screen",
    image: mockups.timeline,
  },
];

export function AIFeatures() {
  return (
    <section className="py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-primary font-display mb-6">
            Powered by Intelligence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI doesn&apos;t just assist—it orchestrates the entire workflow to ensure quality and speed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex flex-col p-6 lg:p-8 rounded-3xl bg-surface border border-border"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-3 font-display text-primary">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
              <div className="mt-auto pt-8">
                <LaptopMockup
                  label={feature.label}
                  image={feature.image}
                  tilt="none"
                  className="!rounded-xl p-1"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
