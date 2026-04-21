"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LaptopMockupProps {
  image?: string;
  label: string;
  alt?: string;
  tilt?: "none" | "left" | "right" | "up" | "down";
  className?: string;
}

export function LaptopMockup({
  image,
  label,
  alt,
  tilt = "none",
  className,
}: LaptopMockupProps) {
  // We're using a placeholder, so we just display a nice block.
  // When real images are added, an <Image /> component or similar would go here.
  
  const tiltClasses = {
    none: "",
    left: "-rotate-y-6 rotate-x-6",
    right: "rotate-y-6 rotate-x-6",
    up: "rotate-x-12",
    down: "-rotate-x-12",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative mx-auto w-full max-w-4xl rounded-2xl md:rounded-[2rem] border border-border bg-surface p-2 shadow-2xl md:p-4",
        "[perspective:2000px]", // To give depth if we apply 3D transforms
        className
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden rounded-xl md:rounded-[1.5rem] bg-muted/50 border border-border/50 flex flex-col items-center justify-center transition-transform duration-700 ease-out transform-gpu",
          tiltClasses[tilt]
        )}
      >
        {/* Placeholder Content */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02] dark:to-white/[0.02] pointer-events-none" />
        
        <span className="relative z-10 text-sm md:text-lg font-medium text-muted-foreground/80 font-display tracking-tight px-6 text-center">
          {label}
        </span>
        
        {/* Helper comment to remind user where to insert image later */}
        {/* <Image src={image} alt={alt} fill className="object-cover" /> */}
      </div>
    </motion.div>
  );
}
