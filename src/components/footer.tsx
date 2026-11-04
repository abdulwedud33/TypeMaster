import React from "react";
import Link from "next/link";
import { Keyboard, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#262B38] bg-[#0D0F14] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#858B99]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#D4F36B] flex items-center justify-center text-[#0D0F14]">
            <Keyboard className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-[#F1F3F5]">TypeMaster</span>
          <span>— Precision Touch Typing Academy</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/learn" className="hover:text-[#F1F3F5] transition-colors">Curriculum</Link>
          <Link href="/practice" className="hover:text-[#F1F3F5] transition-colors">Practice</Link>
          <Link href="/test" className="hover:text-[#F1F3F5] transition-colors">Tests</Link>
          <Link href="/progress" className="hover:text-[#F1F3F5] transition-colors">Progress</Link>
          <Link href="/settings" className="hover:text-[#F1F3F5] transition-colors">Settings</Link>
        </div>

        <div className="flex items-center gap-1">
          <span>Built for dedicated typing mastery</span>
        </div>
      </div>
    </footer>
  );
}

