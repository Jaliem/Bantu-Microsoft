"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I ensure the quality of the student's work?",
    answer: "Every task goes through an AI Quality Gate that checks the submission against the agreed SOP. Additionally, funds are held in escrow and only released when you approve the final work.",
  },
  {
    question: "What happens if a student doesn't complete the task on time?",
    answer: "Deadlines are strictly enforced. If a task is missed, it's automatically returned to the marketplace, and your escrow funds are refunded or reallocated. Students lose ranking points for missed deadlines.",
  },
  {
    question: "How does the portfolio verification work?",
    answer: "Once a task is successfully completed and approved, BANTU automatically generates a verified portfolio entry. It includes the task description, AI validation score, and your rating/review. Students cannot alter this data.",
  },
  {
    question: "Is there a minimum budget for posting a micro-task?",
    answer: "Yes, to ensure fair compensation, all tasks must meet a minimum hourly rate equivalent set by BANTU, but micro-tasks can be as small as a single 1-hour job.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2.1rem,4vw,3.8rem)] font-semibold tracking-[-0.03em] leading-tight text-primary-foreground font-display mb-4 text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/75 leading-relaxed text-balance">
            Everything you need to know about how BANTU works.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-2xl overflow-hidden bg-background transition-colors hover:bg-muted/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between gap-4"
              >
                <span className="font-semibold text-lg md:text-xl tracking-tight text-foreground text-balance">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-300",
                    openIndex === index ? "rotate-180" : ""
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-base md:text-lg text-muted-foreground leading-relaxed text-balance">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
