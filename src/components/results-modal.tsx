"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  RotateCcw,
  ArrowRight,
  Trophy,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Delete,
  Check,
} from "lucide-react";

export interface TypingResultData {
  sessionType: "lesson" | "test" | "practice" | "weak_keys" | "custom";
  lessonId?: string;
  wpm: number;
  grossWpm: number;
  accuracy: number;
  durationSeconds: number;
  correctCharacters: number;
  incorrectCharacters: number;
  correctedErrors?: number;
  uncorrectedErrors?: number;
  totalKeystrokes: number;
  backspaceCount: number;
  mistypedKeys: Record<string, number>;
  correctKeys: Record<string, number>;
  completedAt: string;
}

interface ResultsModalProps {
  data: TypingResultData;
  onRetry: () => void;
  onClose: () => void;
  nextLessonHref?: string;
}

export function ResultsModal({
  data,
  onRetry,
  onClose,
  nextLessonHref,
}: ResultsModalProps) {
  // Save results to API in the background
  React.useEffect(() => {
    async function saveSession() {
      try {
        if (data.sessionType === "lesson" && data.lessonId) {
          await fetch("/api/lessons/attempt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } else {
          await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        }
      } catch (err) {
        console.error("Failed to save typing session:", err);
      }
    }
    saveSession();
  }, [data]);

  const getRating = (wpm: number, accuracy: number) => {
    if (wpm >= 80 && accuracy >= 97) return { label: "Grandmaster", color: "text-[#D4F36B]" };
    if (wpm >= 60 && accuracy >= 95) return { label: "Master Typist", color: "text-[#D4F36B]" };
    if (wpm >= 45 && accuracy >= 92) return { label: "Proficient", color: "text-[#8B7CFF]" };
    if (wpm >= 30 && accuracy >= 88) return { label: "Developing", color: "text-blue-400" };
    return { label: "Apprentice", color: "text-[#858B99]" };
  };

  const rating = getRating(data.wpm, data.accuracy);
  const sortedMistakes = Object.entries(data.mistypedKeys).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#13161F] border border-[#1E2333] p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2333] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4F36B]/15 border border-[#D4F36B]/30 flex items-center justify-center text-[#D4F36B]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F1F3F5]">Session Completed!</h2>
              <span className={cn("text-xs font-semibold uppercase tracking-wider", rating.color)}>
                Rating: {rating.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[#858B99] hover:text-[#F1F3F5] transition-colors"
          >
            Esc to close
          </button>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col">
            <span className="text-xs text-[#858B99] font-medium">Speed</span>
            <span className="text-3xl font-black font-mono text-[#D4F36B]">{data.wpm}</span>
            <span className="text-[10px] text-[#858B99]">Net WPM</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col">
            <span className="text-xs text-[#858B99] font-medium">Accuracy</span>
            <span className="text-3xl font-black font-mono text-[#F1F3F5]">{data.accuracy}%</span>
            <span className="text-[10px] text-[#858B99]">{data.incorrectCharacters} total errors</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col">
            <span className="text-xs text-[#858B99] font-medium">Gross WPM</span>
            <span className="text-3xl font-black font-mono text-[#8B7CFF]">{data.grossWpm}</span>
            <span className="text-[10px] text-[#858B99]">Raw velocity</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col">
            <span className="text-xs text-[#858B99] font-medium">Time</span>
            <span className="text-3xl font-black font-mono text-[#F1F3F5]">{data.durationSeconds}s</span>
            <span className="text-[10px] text-[#858B99]">{data.totalKeystrokes} keystrokes</span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col gap-2.5 text-xs text-[#858B99]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct Characters
            </span>
            <span className="font-mono text-[#F1F3F5] font-semibold">{data.correctCharacters}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Total Mistakes Made
            </span>
            <span className="font-mono text-[#F1F3F5] font-semibold">{data.incorrectCharacters}</span>
          </div>

          {data.correctedErrors !== undefined && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-teal-400">
                <Check className="w-3.5 h-3.5" /> Corrected with Backspace
              </span>
              <span className="font-mono text-[#F1F3F5] font-semibold">{data.correctedErrors}</span>
            </div>
          )}

          {data.uncorrectedErrors !== undefined && data.uncorrectedErrors > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" /> Uncorrected in Text
              </span>
              <span className="font-mono text-[#F1F3F5] font-semibold">{data.uncorrectedErrors}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-[#1E2333]">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Delete className="w-3.5 h-3.5" /> Backspaces Used
            </span>
            <span className="font-mono text-[#F1F3F5] font-semibold">{data.backspaceCount}</span>
          </div>
        </div>

        {/* Mistyped keys list if any */}
        {sortedMistakes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#858B99] uppercase tracking-wider">
              Keys to Practice:
            </span>
            <div className="flex flex-wrap gap-2">
              {sortedMistakes.slice(0, 6).map(([char, count]) => (
                <div
                  key={char}
                  className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-1.5 text-xs text-red-300 font-mono"
                >
                  <span className="font-bold">{char === " " ? "Space" : char}</span>
                  <span className="text-[10px] opacity-75">({count}x)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onRetry}
            className="px-4 py-2.5 rounded-xl bg-[#090A0F] hover:bg-[#1E2333] text-[#F1F3F5] text-xs font-semibold transition-colors flex items-center gap-2 border border-[#1E2333]"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>

          {nextLessonHref ? (
            <Link
              href={nextLessonHref}
              className="px-5 py-2.5 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-[#D4F36B]/20 uppercase tracking-wider"
            >
              Next Lesson <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-[#D4F36B]/20 uppercase tracking-wider"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
