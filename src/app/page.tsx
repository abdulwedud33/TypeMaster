"use client";

import React from "react";
import Link from "next/link";
import { TypingEngine } from "@/components/typing-engine";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Timer,
  Target,
  Zap,
  Flame,
  Award,
  ShieldCheck,
  Keyboard,
} from "lucide-react";

const SAMPLE_TEXT =
  "Touch typing is the art of expressing your thoughts at the speed of mind. Keep your fingers resting on the home row anchors, F and J, and trust your muscle memory.";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] p-6 sm:p-10 max-w-6xl mx-auto w-full gap-10">
      {/* Hero Header */}
      <section className="flex flex-col items-center text-center gap-4 pt-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#13161F] border border-[#1E2333] text-xs font-semibold text-[#8B7CFF] shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D4F36B]" />
          <span>Structured Touch Typing Academy</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F1F3F5] leading-tight">
          Master the Keyboard with{" "}
          <span className="text-[#D4F36B] underline decoration-[#D4F36B]/40 decoration-wavy underline-offset-8">
            Fluid Precision
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#858B99] max-w-xl font-normal leading-relaxed">
          From home-row anchor keys to advanced code syntax. Learn proper finger placement,
          boost your WPM, eliminate errors, and build lasting muscle memory.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/learn"
            className="px-6 py-3 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4F36B]/20 flex items-center gap-2"
          >
            Start Curriculum <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/test"
            className="px-6 py-3 rounded-xl bg-[#13161F] hover:bg-[#1E2333] text-[#F1F3F5] font-semibold text-xs uppercase tracking-wider border border-[#1E2333] transition-all flex items-center gap-2"
          >
            Take 60s Test <Timer className="w-4 h-4 text-[#8B7CFF]" />
          </Link>
        </div>
      </section>

      {/* Interactive Quick Practice Arena */}
      <section className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#858B99] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#D4F36B] animate-pulse" />
            <span>Interactive Demo • Start Typing</span>
          </div>
          <span className="text-xs text-[#858B99] font-mono">Standard QWERTY Layout</span>
        </div>

        <TypingEngine
          initialText={SAMPLE_TEXT}
          sessionType="practice"
          showKeyboardToggle={true}
        />
      </section>

      {/* Feature Pillar Highlights */}
      <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="p-6 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-3 hover:border-[#1E2333]/80 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-[#D4F36B]/10 border border-[#D4F36B]/25 flex items-center justify-center text-[#D4F36B]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#F1F3F5]">10-Level Curriculum</h3>
          <p className="text-xs text-[#858B99] leading-relaxed">
            Progressive training starting from tactile bumps on F & J through home row, top row,
            numbers, symbols, and developer code challenges.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-3 hover:border-[#1E2333]/80 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-[#8B7CFF]/10 border border-[#8B7CFF]/25 flex items-center justify-center text-[#8B7CFF]">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#F1F3F5]">Weak-Key Diagnostics</h3>
          <p className="text-xs text-[#858B99] leading-relaxed">
            Identifies your exact mistyped characters from real sessions and generates targeted
            drills to break through speed plateaus.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-3 hover:border-[#1E2333]/80 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#F1F3F5]">Tactile Mechanical Engine</h3>
          <p className="text-xs text-[#858B99] leading-relaxed">
            Zero-latency physical keyboard tracking, Web Audio synthesized clicks, and visual
            finger-color cues for every keystroke.
          </p>
        </div>
      </section>
    </div>
  );
}
