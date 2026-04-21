"use client";

import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";

const stats = [
  { value: "10k+", label: "Micro-Tasks Completed" },
  { value: "5k+", label: "Verified Students" },
  { value: "2k+", label: "Active MSMEs" },
  { value: "Rp 5B+", label: "Paid to Students" },
];

const testimonials = [
  {
    name: "Nick Kasten",
    role: "CEO AT ONLY EVERYTHING",
    title: "Enhanced Onboarding with BANTU",
    quote: "BANTU has totally changed the game for how I bring new clients on board. It's slick, easy to use, and lets me tweak things to make it 'me'. Clients are loving how smooth everything goes from day one.",
    avatar: "https://i.pravatar.cc/150?u=nick"
  },
  {
    name: "Jeremy Moore",
    role: "CEO AT SOCIAL PRO",
    title: "Branded Client Portal - A Game Changer",
    quote: "The task management in BANTU has notably increased our throughput. It enables consistent, fast execution, making our clients feel more valued and supported.",
    avatar: "https://i.pravatar.cc/150?u=jeremy"
  },
  {
    name: "Sarah Chen",
    role: "FOUNDER AT SNOW SERVICES",
    title: "A Game Changer for Content",
    quote: "We needed dozens of short product descriptions. The students on BANTU delivered within 48 hours. The AI SOP generator is pure magic.",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Budi Santoso",
    role: "MARKETING DIRECTOR",
    title: "Verified Talent Pipeline",
    quote: "We don't even look at traditional CVs anymore for junior roles. We look at their BANTU portfolio. It shows actual proof of work and reliability.",
    avatar: "https://i.pravatar.cc/150?u=budi"
  }
];

export function SocialProof() {
  // Use align: "center" so it peeks out on the sides of the full-width screen
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" });

  return (
    <section className="py-32 bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Logos Placeholder */}
        <div className="mb-32 text-center">
          <p className="text-xs sm:text-sm font-semibold text-[#839587] uppercase tracking-[0.22em] mb-10 font-sans">
            Trusted by top universities and growing businesses
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-32 bg-[#dae2fd]/50 rounded-lg flex items-center justify-center text-xs text-[#3d4a3f] font-sans font-medium">
                Logo {i}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-tight text-inherit font-sans mb-3">
                {stat.value}
              </div>
              <div className="text-[#3d4a3f] font-semibold tracking-wide font-sans">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials Carousel - Full Width */}
      <div className="w-full relative cursor-grab active:cursor-grabbing">
        <div className="overflow-hidden px-4 sm:px-12" ref={emblaRef}>
          <div className="flex -ml-6 items-center">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="flex-[0_0_100%] min-w-0 md:flex-[0_0_60%] lg:flex-[0_0_45%] pl-6 py-8"
              >
                <div className={`p-8 md:p-12 rounded-4xl bg-[#ffffff] h-full shadow-[0_8px_30px_rgba(19,27,46,0.08)] transition-all duration-500 hover:-translate-y-2
                  ${i === 0 ? "ring-2 ring-[#006d38]" : "ring-1 ring-[#bccabc]/20"}
                `}>
                  <div className="flex items-center gap-6 mb-8">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-20 h-20 rounded-full object-cover shrink-0 ring-4 ring-[#f2f3ff]"
                    />
                    <div>
                      <div className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-inherit font-sans mb-2">{testimonial.name}</div>
                      <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#dae2fd]/50 text-[#006d38] text-xs font-bold tracking-wider uppercase font-sans">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#3d4a3f] leading-relaxed text-lg font-sans">
                    <strong className="text-inherit text-xl font-semibold tracking-tight block mb-2 text-balance">{testimonial.title}</strong>
                    "{testimonial.quote}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
