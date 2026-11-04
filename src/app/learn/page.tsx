"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  RotateCcw,
  HelpCircle,
  ShieldCheck,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonItem {
  id: string;
  level: number;
  orderIndex: number;
  title: string;
  description: string;
  lessonType: string;
  targetKeys: string;
  fingerNotes: string;
  completed?: boolean;
  bestWpm?: number | null;
  bestAccuracy?: number | null;
}

const LEVEL_NAMES: Record<number, { title: string; subtitle: string; keysCount: string }> = {
  1: {
    title: "Level 1: Home Row Fundamentals",
    subtitle: "Anchor keys F & J, D & K, S & L, A & ;, G & H, and home-row words & sentences.",
    keysCount: "8 Lessons • A S D F G H J K L ;",
  },
  2: {
    title: "Level 2: Top Row Letters",
    subtitle: "Reaching up from home row: E & I, R & U, T & Y, W & O, Q & P.",
    keysCount: "6 Lessons • Q W E R T Y U I O P",
  },
  3: {
    title: "Level 3: Bottom Row Letters",
    subtitle: "Reaching down from home row: V & M, B & N, C & ., X & Z.",
    keysCount: "5 Lessons • Z X C V B N M .",
  },
  4: {
    title: "Level 4: All Lowercase N-Grams & Rhythm",
    subtitle: "Common 2-letter & 3-letter clusters (th, ing, ion, re) and fluent sentences.",
    keysCount: "2 Lessons • All 26 Lowercase Letters",
  },
  5: {
    title: "Level 5: Capital Letters & Shift Discipline",
    subtitle: "Opposite-hand Shift rule: Left shift for right hand, Right shift for left hand.",
    keysCount: "2 Lessons • Shift + A-Z",
  },
  6: {
    title: "Level 6: Numbers & Dates",
    subtitle: "Reaching up to the top number row (1 2 3 4 5 and 6 7 8 9 0).",
    keysCount: "3 Lessons • Numbers 0 through 9",
  },
  7: {
    title: "Level 7: Punctuation & Special Symbols",
    subtitle: "Period, comma, quotes, question marks, brackets, and math symbols.",
    keysCount: "3 Lessons • All Common Symbols",
  },
  8: {
    title: "Level 8: Vocabulary & Dexterity",
    subtitle: "High-frequency beginner, intermediate, and advanced multi-syllable vocabulary.",
    keysCount: "3 Lessons • 100+ Common Words",
  },
  9: {
    title: "Level 9: Natural Sentences & Paragraphs",
    subtitle: "Real English literature, dialogue quotes, questions, and sustained typing flow.",
    keysCount: "2 Lessons • Continuous Prose",
  },
  10: {
    title: "Level 10: Advanced Developer & Speed Challenges",
    subtitle: "Programming syntax, TypeScript brackets, arrow functions, and speed tests.",
    keysCount: "2 Lessons • Code Syntax & Grandmaster",
  },
};

export default function LearnPage() {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<number>(1);

  useEffect(() => {
    async function fetchCurriculum() {
      try {
        const res = await fetch("/api/curriculum");
        if (res.ok) {
          const data = await res.json();
          setLessons(data.lessons);
        }
      } catch (err) {
        console.error("Failed to load curriculum:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCurriculum();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4F36B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#858B99]">Loading progressive curriculum...</span>
        </div>
      </div>
    );
  }

  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  const currentLevelLessons = lessons.filter((l) => l.level === activeLevel);
  const totalCompleted = lessons.filter((l) => l.completed).length;

  return (
    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2333] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13161F] border border-[#1E2333] text-xs font-semibold text-[#D4F36B] mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Progressive Touch Typing Academy</span>
          </div>
          <h1 className="text-3xl font-black text-[#F1F3F5] tracking-tight">Learning Curriculum</h1>
          <p className="text-xs sm:text-sm text-[#858B99] mt-1">
            Gentle progressive steps designed for beginners—mastering finger placement two keys at a time.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#13161F] p-4 rounded-2xl border border-[#1E2333]">
          <div className="flex flex-col text-right">
            <span className="text-xs text-[#858B99]">Mastered</span>
            <span className="text-xl font-bold font-mono text-[#D4F36B]">
              {totalCompleted} / {lessons.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4F36B]/15 border border-[#D4F36B]/30 flex items-center justify-center text-[#D4F36B]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Beginner Guidance Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#13161F] via-[#1A1E2B] to-[#13161F] border border-[#1E2333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#D4F36B]/15 border border-[#D4F36B]/30 flex items-center justify-center text-[#D4F36B] shrink-0 mt-0.5">
            <Keyboard className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-[#F1F3F5] uppercase tracking-wider">
              Golden Touch Typing Rules for Beginners
            </span>
            <p className="text-xs text-[#858B99] leading-relaxed">
              1. Never look down at your keyboard. • 2. Rest index fingers on tactile bumps <strong>F & J</strong>. • 3. Prioritize 95%+ accuracy before trying to type fast.
            </p>
          </div>
        </div>
      </div>

      {/* Level Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {levels.map((lvl) => {
          const lvlLessons = lessons.filter((l) => l.level === lvl);
          const lvlCompleted = lvlLessons.filter((l) => l.completed).length;
          const isAllDone = lvlLessons.length > 0 && lvlCompleted === lvlLessons.length;
          const isSelected = activeLevel === lvl;

          return (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 border",
                isSelected
                  ? "bg-[#D4F36B] text-[#0D0F14] border-[#D4F36B] shadow-md shadow-[#D4F36B]/20"
                  : "bg-[#13161F] text-[#858B99] hover:text-[#F1F3F5] border-[#1E2333]"
              )}
            >
              <span>Level {lvl}</span>
              {isAllDone && (
                <CheckCircle2
                  className={cn("w-3.5 h-3.5", isSelected ? "text-[#0D0F14]" : "text-[#D4F36B]")}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Level Description Card */}
      <div className="p-6 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CFF]">
            {LEVEL_NAMES[activeLevel]?.keysCount}
          </span>
          <span className="text-xs text-[#858B99]">Target: 90%+ Accuracy to pass</span>
        </div>
        <h2 className="text-2xl font-black text-[#F1F3F5] mt-1">
          {LEVEL_NAMES[activeLevel]?.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#858B99] mt-1">
          {LEVEL_NAMES[activeLevel]?.subtitle}
        </p>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentLevelLessons.map((lesson) => {
          return (
            <div
              key={lesson.id}
              className={cn(
                "p-6 rounded-3xl bg-[#13161F] border transition-all duration-200 flex flex-col justify-between gap-4 group",
                lesson.completed
                  ? "border-emerald-500/30 hover:border-emerald-500/60"
                  : "border-[#1E2333] hover:border-[#D4F36B]/60"
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#858B99]">
                    Lesson {lesson.orderIndex}
                  </span>
                  {lesson.completed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#090A0F] text-[#D4F36B] border border-[#1E2333]">
                      Target: {lesson.targetKeys}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#F1F3F5] group-hover:text-[#D4F36B] transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-xs text-[#858B99] leading-relaxed">
                  {lesson.description}
                </p>

                {lesson.fingerNotes && (
                  <div className="mt-2 p-3 rounded-2xl bg-[#090A0F] border border-[#1E2333] text-[11px] text-[#858B99]">
                    <span className="text-[#F1F3F5] font-semibold">Finger placement: </span>
                    {lesson.fingerNotes}
                  </div>
                )}
              </div>

              {/* Action & Stats Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1E2333]">
                {lesson.completed && lesson.bestWpm ? (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#D4F36B] font-mono font-bold">{lesson.bestWpm} WPM</span>
                    <span className="text-[#858B99] font-mono">{lesson.bestAccuracy}% Acc</span>
                  </div>
                ) : (
                  <span className="text-xs text-[#858B99] italic">5 step exercises</span>
                )}

                <Link
                  href={`/learn/${lesson.id}`}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    lesson.completed
                      ? "bg-[#090A0F] hover:bg-[#1E2333] text-[#F1F3F5] border border-[#1E2333]"
                      : "bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] shadow-sm shadow-[#D4F36B]/20 uppercase tracking-wider"
                  )}
                >
                  {lesson.completed ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" /> Revisit
                    </>
                  ) : (
                    <>
                      Start Drill <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
