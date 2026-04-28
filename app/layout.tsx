import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SmoothScroll } from "../components/SmoothScroll";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toaster } from "sonner";
import ChatSupport from "@/components/ChatSupport";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bantu - Connect Students & Local Businesses",
  description: "Bantu is a marketplace connecting motivated students with local businesses for part-time jobs, freelance projects, and internships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} antialiased`}
    >
      <body className="bg-brand-light text-brand-dark">
        <AuthProvider>
          <SmoothScroll>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <div className="flex-1 flex flex-col">
                {children}
              </div>
              <Footer />
            </div>
          </SmoothScroll>
          <ChatSupport />
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
