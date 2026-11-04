import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "TypeMaster – Personal Touch Typing Academy",
  description:
    "Master touch typing from beginner to grandmaster with a progressive 10-level curriculum, interactive mechanical virtual keyboard, real-time analytics, and weak-key targeting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090A0F] text-[#F1F3F5] antialiased selection:bg-[#D4F36B]/30 selection:text-[#D4F36B] flex flex-col">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area Offset for Desktop Sidebar */}
        <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Minimal Clean Footer */}
          <footer className="border-t border-[#1E2333]/80 py-6 px-6 sm:px-8 text-xs text-[#858B99] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-medium">
              TypeMaster • Precision Touch Typing Academy
            </span>
            <span className="text-[11px] opacity-75">
              Level 1 to 10 Progressive QWERTY Training
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
