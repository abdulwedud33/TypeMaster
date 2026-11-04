import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "TypeMaster – Professional Typing Practice & Touch Typing Academy",
  description:
    "Master touch typing from beginner to grandmaster with progressive 10-level curriculum, interactive mechanical virtual keyboard, real-time analytics, and weak-key targeting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0D0F14] text-[#F1F3F5] antialiased selection:bg-[#D4F36B]/30 selection:text-[#D4F36B]">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

