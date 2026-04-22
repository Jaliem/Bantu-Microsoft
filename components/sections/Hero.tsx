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

	const scroll = (direction: "left" | "right") => {
		if (carouselRef.current) {
			const scrollAmount = direction === "left" ? -320 : 320;
			carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
		}
	};

	return (
		<section className="relative min-h-screen pt-32 pb-20 bg-background text-foreground">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl">
				{/* Main Hero Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="relative rounded-[2rem] overflow-hidden bg-primary text-primary-foreground shadow-2xl h-150 flex items-center"
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

					<div className="relative z-10 px-8 sm:px-16 md:px-24 w-full md:w-3/4 lg:w-4/5 pt-12 pb-12">
						<h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium tracking-tight font-display mb-6 leading-[1.05] text-balance">
							Pekerjakan ahli yang dibutuhkan bisnis Anda
						</h1>

						<p className="text-base md:text-xl text-primary-foreground/80 mb-10 max-w-2xl font-sans leading-relaxed text-balance font-light">
							Akses pekerja lepas terampil yang siap membantu Anda membangun dan
							mengembangkan bisnis — tanpa komitmen penuh waktu
						</p>

						{/* Toggle: Hire vs Work */}
						<div className="flex bg-black/20 backdrop-blur-md rounded-full p-1 w-fit mb-6 shadow-inner border border-white/10">
							<button className="px-6 py-2 rounded-full bg-white/20 text-white font-medium text-sm transition-all shadow-sm">
								Saya ingin merekrut
							</button>
							<button className="px-6 py-2 rounded-full text-white/70 hover:bg-white/10 font-medium text-sm transition-all">
								Saya ingin bekerja
							</button>
						</div>

						{/* Search Bar */}
						<div className="relative max-w-2xl group flex items-center bg-white rounded-2xl p-2 pl-6 focus-within:ring-2 focus-within:ring-primary-foreground/50 transition-all shadow-xl">
							<input
								type="text"
								placeholder="Cari layanan apa saja..."
								className="w-full bg-transparent border-none outline-none text-brand-dark placeholder:text-brand-dark/50 font-sans text-base leading-none"
							/>
							<button className="shrink-0 h-10 px-6 rounded-xl bg-primary hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md">
								<Search className="w-5 h-5 text-white" />
								<span className="text-white font-medium hidden sm:block">
									Cari
								</span>
							</button>
						</div>

						{/* Suggestion Pills */}
						<div className="flex flex-wrap gap-3 mt-8">
							{["Desain Web", "Pengembangan AI", "Pengeditan Video", "Google Ads"].map(
								(tag) => (
									<button
										key={tag}
										className="px-4 py-1.5 rounded-full border border-white/20 text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-colors flex items-center gap-2"
									>
										{tag}
										<ArrowRight className="w-3 h-3 opacity-60" />
									</button>
								)
							)}
						</div>
					</div>
				</motion.div>

				{/* Popular Services Carousel */}
				<div className="mt-20 sm:mt-24 mb-12 relative group">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-3xl sm:text-5xl font-medium tracking-tight leading-tight text-foreground font-display text-balance">
							Layanan populer
						</h2>
						<div className="hidden sm:flex gap-2">
							<button
								onClick={() => scroll("left")}
								className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-border hover:bg-muted transition-colors"
								aria-label="Scroll left"
							>
								<ChevronLeft className="w-5 h-5 text-foreground" />
							</button>
							<button
								onClick={() => scroll("right")}
								className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-border hover:bg-muted transition-colors"
								aria-label="Scroll right"
							>
								<ChevronRight className="w-5 h-5 text-foreground" />
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
								className={`shrink-0 w-60 sm:w-70 h-80 rounded-[2rem] p-1 flex flex-col snap-start cursor-pointer border border-border/50 hover:-translate-y-2 transition-transform duration-300 shadow-lg bg-primary`}
							>
								<div className="p-5 flex-1 mt-2">
									<h3 className="text-xl font-medium tracking-tight text-white font-display leading-tight text-balance">
										{service.title}
									</h3>
								</div>
								{/* Bottom Image Area (Placeholder) */}
								<div className="h-48 w-full bg-white rounded-[1.5rem] mt-auto overflow-hidden relative">
									{/* Decorative Elements replacing actual images */}
									<div className="w-full h-full flex items-center justify-center opacity-20 bg-brand-light">
										<span className="font-display font-medium text-xl text-primary">
											BANTU
										</span>
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
