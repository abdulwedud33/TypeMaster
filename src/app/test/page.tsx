"use client";

import React, { useState } from "react";
import { TypingEngine } from "@/components/typing-engine";
import { Timer, Trophy, Sparkles, Flame, History, Award } from "lucide-react";
import { cn } from "@/lib/utils";

type TestDifficulty = "beginner" | "intermediate" | "advanced" | "code" | "passages";

const TEST_TEXTS: Record<TestDifficulty, string[]> = {
  beginner: [
    "the simple quick brown fox jumps over a lazy dog while children play in the bright warm sunshine every summer day and birds sing in tall green trees",
    "learning to type without looking is one of the most rewarding skills you can master with calm daily dedication and attention to basic home row posture",
  ],
  intermediate: [
    "Deliberate practice demands constant attention to the keys you struggle with. If you stumble upon punctuation or numbers, slowing down to build clean muscle memory always leads to greater velocity in the long run.",
    "The modern keyboard has become an extension of human cognition. Professional developers, writers, and thinkers spend thousands of hours each year translating conceptual ideas into concrete digital execution.",
  ],
  advanced: [
    "According to computer science pioneers, architecture integrity and clean abstractions dictate software longevity. In 2026, developers navigating complex microservices require effortless keyboard interaction to maintain cognitive focus on high-order algorithmic design.",
    "Comprehensive synchronization of distributed databases introduces non-trivial network latency; consequently, consensus protocols such as Raft and Paxos ensure strict state-machine replication under adversarial partition conditions.",
  ],
  code: [
    "const calculateWpm = (chars: number, secs: number): number => Math.round((chars / 5) / (secs / 60)); export default calculateWpm;",
    "interface SessionState { readonly userId: string; active: boolean; attempts: number[]; } function init(): SessionState { return { userId: 'root', active: true, attempts: [] }; }",
  ],
  passages: [
    "In a world increasingly dominated by automation and artificial intelligence, the ability to formulate thoughts rapidly and transmit them into digital form remains an invaluable personal superpower. Touch typing is not about mechanical repetition; it is the ultimate friction-free medium between human imagination and the digital canvas.",
  ],
};

export default function TestPage() {
  const [duration, setDuration] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<TestDifficulty>("intermediate");
  const [testIndex, setTestIndex] = useState<number>(0);

  const texts = TEST_TEXTS[difficulty];
  const activeText = texts[testIndex % texts.length];

  const durations = [
    { label: "15s", val: 15 },
    { label: "30s", val: 30 },
    { label: "60s", val: 60 },
    { label: "2m", val: 120 },
    { label: "5m", val: 300 },
  ];

  const difficulties: Array<{ id: TestDifficulty; label: string }> = [
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
    { id: "passages", label: "Literature" },
    { id: "code", label: "Code Syntax" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2333] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13161F] border border-[#1E2333] text-xs font-semibold text-[#D4F36B] mb-2">
            <Timer className="w-3.5 h-3.5" />
            <span>Speed & Accuracy Benchmark</span>
          </div>
          <h1 className="text-3xl font-black text-[#F1F3F5] tracking-tight">Timed Typing Tests</h1>
          <p className="text-xs sm:text-sm text-[#858B99] mt-1">
            Test your verified Words Per Minute under timed conditions with strict accuracy grading.
          </p>
        </div>

        <button
          onClick={() => setTestIndex((prev) => prev + 1)}
          className="px-4 py-2.5 rounded-xl bg-[#13161F] hover:bg-[#1E2333] border border-[#1E2333] text-xs font-semibold text-[#8B7CFF] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" /> Change Passage
        </button>
      </div>

      {/* Test Controls Bar */}
      <div className="p-5 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-wrap items-center justify-between gap-4">
        {/* Duration selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#858B99]">Duration:</span>
          <div className="flex items-center gap-1.5">
            {durations.map((d) => (
              <button
                key={d.val}
                onClick={() => setDuration(d.val)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border",
                  duration === d.val
                    ? "bg-[#D4F36B] text-[#0D0F14] border-[#D4F36B] shadow-sm"
                    : "bg-[#090A0F] text-[#858B99] hover:text-[#F1F3F5] border-[#1E2333]"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#858B99]">Mode:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                  difficulty === diff.id
                    ? "bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF]/50"
                    : "bg-[#090A0F] text-[#858B99] hover:text-[#F1F3F5] border-[#1E2333]"
                )}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Typing Engine */}
      <TypingEngine
        key={`test_${duration}_${difficulty}_${testIndex}`}
        initialText={activeText}
        sessionType="test"
        durationLimit={duration}
        showKeyboardToggle={true}
      />
    </div>
  );
}
