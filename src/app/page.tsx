"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TypingEngine } from "@/components/typing-engine";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Timer,
  Target,
  Zap,
  ShieldCheck,
  Flame,
  Award,
} from "lucide-react";

const SAMPLE_TEXT =
  "Touch typing is the art of expressing your thoughts at the speed of mind. Keep your fingers resting on the home row anchors, F and J, and trust your muscle memory.";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-4 pt-12 pb-6 flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171A23] border border-[#262B38] text-xs font-semibold text-[#8B7CFF]">
          <Sparkles className="w-3.5 h-3.5 text-[#D4F36B]" />
          <span>Structured Touch Typing Academy</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#F1F3F5] max-w-3xl leading-tight">
          Master the Keyboard with{" "}
          <span className="text-[#D4F36B] underline decoration-[#D4F36B]/40 decoration-wavy">
            Fluid Precision
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#858B99] max-w-2xl font-normal">
          From home-row fundamentals to advanced programming syntax. Learn proper finger placement,
          boost your WPM, eliminate errors, and build lasting muscle memory.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/learn"
            className="px-6 py-3 rounded-xl bg-[#D4F36B] text-[#0D0F14] font-bold text-sm hover:bg-[#bde050] transition-all shadow-lg shadow-[#D4F36B]/20 flex items-center gap-2"
          >
            Start Curriculum <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/test"
            className="px-6 py-3 rounded-xl bg-[#171A23] text-[#F1F3F5] font-semibold text-sm hover:bg-[#262B38] border border-[#262B38] transition-all flex items-center gap-2"
          >
            Take 60s Test <Timer className="w-4 h-4 text-[#8B7CFF]" />
          </Link>
        </div>
      </section>

      {/* Interactive Quick Practice Area */}
      <section className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between pb-3 px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#858B99] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#D4F36B] animate-pulse" />
            <span>Interactive Demo • Try Typing Now</span>
          </div>
          <span className="text-xs text-[#858B99]">Standard QWERTY Layout</span>
        </div>

        <TypingEngine
          initialText={SAMPLE_TEXT}
          sessionType="practice"
          showKeyboardToggle={true}
        />
      </section>

      {/* Features Overview */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F3F5]">
            Engineered for Serious Typists
          </h2>
          <p className="text-sm text-[#858B99] mt-2">
            Every feature designed to build genuine touch-typing muscle memory without looking down.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#D4F36B]/15 border border-[#D4F36B]/30 flex items-center justify-center text-[#D4F36B]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F1F3F5]">10-Level Progressive Curriculum</h3>
            <p className="text-sm text-[#858B99] leading-relaxed">
              Step-by-step guidance starting from the physical bumps on F & J through home row, top
              row, bottom row, numbers, and advanced code syntax.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF]">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F1F3F5]">Smart Weak-Key Detection</h3>
            <p className="text-sm text-[#858B99] leading-relaxed">
              Identifies your most frequently mistyped keys and dynamically generates personalized
              drills to eliminate problem characters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F1F3F5]">Real-Time Reactive Engine</h3>
            <p className="text-sm text-[#858B99] leading-relaxed">
              Zero-latency physical keyboard tracking, mechanical audio synthesis, per-finger visual
              color cues, and mathematically precise WPM metrics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

