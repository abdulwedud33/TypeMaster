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

const LEVEL_NAMES: Record<number, { title: string; subtitle: string }> = {
  1: { title: "Home Row Fundamentals", subtitle: "Anchor keys F & J, A S D F J K L ; and spacebar" },
  2: { title: "Top Row Letters", subtitle: "Q W E R T Y U I O P integrated with home row" },
  3: { title: "Bottom Row Letters", subtitle: "Z X C V B N M connecting all three letter rows" },
  4: { title: "All Lowercase Letters", subtitle: "N-grams, common words, and fluid lowercase sentences" },
  5: { title: "Capital Letters & Shift", subtitle: "Left and Right Shift key coordination for uppercase" },
  6: { title: "Numbers & Dates", subtitle: "Mastering the top number row: 0 through 9" },
  7: { title: "Punctuation & Special Symbols", subtitle: "Period, comma, quotes, brackets, and math symbols" },
  8: { title: "Common Words & Vocabulary", subtitle: "High-frequency beginner, intermediate & advanced vocabulary" },
  9: { title: "Natural Sentences & Paragraphs", subtitle: "Prose, questions, punctuation, and sustained flow" },
  10: { title: "Advanced Typing & Code Challenges", subtitle: "TypeScript syntax, programming brackets & speed challenges" },
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4F36B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#858B99]">Loading typing curriculum...</span>
        </div>
      </div>
    );
  }

  // Group lessons by level
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  const currentLevelLessons = lessons.filter((l) => l.level === activeLevel);
  const totalCompleted = lessons.filter((l) => l.completed).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262B38] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A23] border border-[#262B38] text-xs font-semibold text-[#D4F36B] mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Standard English QWERTY Curriculum</span>
          </div>
          <h1 className="text-3xl font-black text-[#F1F3F5]">Touch Typing Curriculum</h1>
          <p className="text-xs sm:text-sm text-[#858B99] mt-1">
            Progressive 10-level training from physical anchor keys to advanced programming syntax.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#171A23] p-4 rounded-2xl border border-[#262B38]">
          <div className="flex flex-col text-right">
            <span className="text-xs text-[#858B99]">Curriculum Progress</span>
            <span className="text-xl font-bold font-mono text-[#D4F36B]">
              {totalCompleted} / {lessons.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#D4F36B]/15 border border-[#D4F36B]/30 flex items-center justify-center text-[#D4F36B]">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Level Tabs (Horizontal Pill Selector) */}
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
                "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 border",
                isSelected
                  ? "bg-[#D4F36B] text-[#0D0F14] border-[#D4F36B] shadow-md shadow-[#D4F36B]/20"
                  : "bg-[#171A23] text-[#858B99] hover:text-[#F1F3F5] border-[#262B38]"
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

      {/* Current Level Header Description */}
      <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CFF]">
          Level {activeLevel}
        </span>
        <h2 className="text-2xl font-black text-[#F1F3F5]">
          {LEVEL_NAMES[activeLevel]?.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#858B99] mt-1">
          {LEVEL_NAMES[activeLevel]?.subtitle}
        </p>
      </div>

      {/* Lessons List in this Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentLevelLessons.map((lesson, idx) => {
          return (
            <div
              key={lesson.id}
              className={cn(
                "p-6 rounded-2xl bg-[#171A23] border transition-all duration-200 flex flex-col justify-between gap-4 group",
                lesson.completed
                  ? "border-emerald-500/30 hover:border-emerald-500/60"
                  : "border-[#262B38] hover:border-[#D4F36B]/60"
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#858B99]">
                    Lesson {activeLevel}.{idx + 1}
                  </span>
                  {lesson.completed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0D0F14] text-[#858B99] border border-[#262B38]">
                      Keys: {lesson.targetKeys}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[#F1F3F5] group-hover:text-[#D4F36B] transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-xs text-[#858B99] leading-relaxed">
                  {lesson.description}
                </p>

                {lesson.fingerNotes && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#0D0F14] border border-[#262B38] text-[11px] text-[#858B99]">
                    <span className="text-[#F1F3F5] font-semibold">Finger placement: </span>
                    {lesson.fingerNotes}
                  </div>
                )}
              </div>

              {/* Action & Stats Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#262B38]/60">
                {lesson.completed && lesson.bestWpm ? (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#D4F36B] font-mono font-bold">{lesson.bestWpm} WPM</span>
                    <span className="text-[#858B99] font-mono">{lesson.bestAccuracy}% Acc</span>
                  </div>
                ) : (
                  <span className="text-xs text-[#858B99] italic">Not completed yet</span>
                )}

                <Link
                  href={`/learn/${lesson.id}`}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    lesson.completed
                      ? "bg-[#0D0F14] hover:bg-[#262B38] text-[#F1F3F5] border border-[#262B38]"
                      : "bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] shadow-sm shadow-[#D4F36B]/20"
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

