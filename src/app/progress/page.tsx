"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Calendar,
  Flame,
  Zap,
  Target,
  Clock,
  BookOpen,
  Trophy,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Award,
  Keyboard,
  CheckCircle2,
} from "lucide-react";
import { formatTime, formatDate, cn } from "@/lib/utils";

interface ProgressStats {
  progress: {
    currentLevel: number;
    lessonsCompleted: number;
    totalPracticeSeconds: number;
    totalCharactersTyped: number;
    bestWpm: number;
    averageAccuracy: number;
    currentStreak: number;
    longestStreak: number;
  };
  recentSessions: any[];
  weeklyActivity: any[];
}

interface WeakKeyItem {
  character: string;
  total: number;
  errors: number;
  accuracy: number;
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressStats | null>(null);
  const [weakKeys, setWeakKeys] = useState<WeakKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, weakRes] = await Promise.all([
          fetch("/api/stats/dashboard"),
          fetch("/api/stats/weak-keys"),
        ]);

        if (dashRes.ok) {
          const dashJson = await dashRes.json();
          setData(dashJson);
        }
        if (weakRes.ok) {
          const weakJson = await weakRes.json();
          setWeakKeys(weakJson.weakKeys || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4F36B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#858B99]">Loading your personal metrics...</span>
        </div>
      </div>
    );
  }

  const p = data?.progress || {
    currentLevel: 1,
    lessonsCompleted: 0,
    totalPracticeSeconds: 0,
    totalCharactersTyped: 0,
    bestWpm: 0,
    averageAccuracy: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  // Generate GitHub-style contribution heatmap squares for past 60 days
  const today = new Date();
  const calendarDays = [];
  for (let i = 59; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const activity = data?.weeklyActivity?.find((w) => w.activityDate === dateStr);
    const count = activity?.practiceSeconds || 0;
    calendarDays.push({ date: dateStr, seconds: count });
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262B38] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A23] border border-[#262B38] text-xs font-semibold text-[#8B7CFF] mb-2">
            <LineChart className="w-3.5 h-3.5" />
            <span>Longitudinal Typing Analytics</span>
          </div>
          <h1 className="text-3xl font-black text-[#F1F3F5]">Progress & Analytics</h1>
          <p className="text-xs sm:text-sm text-[#858B99] mt-1">
            Detailed performance tracking, weak keys, consistency streaks, and milestone achievements.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#171A23] border border-[#262B38] self-start sm:self-auto">
          {(["7d", "30d", "90d", "all"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all uppercase",
                timeFilter === filter
                  ? "bg-[#D4F36B] text-[#0D0F14]"
                  : "text-[#858B99] hover:text-[#F1F3F5]"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-1">
          <span className="text-xs text-[#858B99] font-medium flex items-center justify-between">
            Personal Best <Zap className="w-4 h-4 text-[#D4F36B]" />
          </span>
          <span className="text-3xl font-black font-mono text-[#D4F36B] mt-1">
            {p.bestWpm} WPM
          </span>
          <span className="text-[11px] text-[#858B99]">Top verified speed record</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-1">
          <span className="text-xs text-[#858B99] font-medium flex items-center justify-between">
            Lifetime Accuracy <Target className="w-4 h-4 text-[#8B7CFF]" />
          </span>
          <span className="text-3xl font-black font-mono text-[#F1F3F5] mt-1">
            {p.averageAccuracy}%
          </span>
          <span className="text-[11px] text-[#858B99]">Mean across all keystrokes</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-1">
          <span className="text-xs text-[#858B99] font-medium flex items-center justify-between">
            Current / Longest Streak <Flame className="w-4 h-4 text-amber-400" />
          </span>
          <span className="text-3xl font-black font-mono text-[#F1F3F5] mt-1">
            {p.currentStreak} <span className="text-sm font-normal text-[#858B99]">/ {p.longestStreak} d</span>
          </span>
          <span className="text-[11px] text-[#858B99]">Consecutive practice days</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-1">
          <span className="text-xs text-[#858B99] font-medium flex items-center justify-between">
            Volume Typed <Keyboard className="w-4 h-4 text-emerald-400" />
          </span>
          <span className="text-3xl font-black font-mono text-[#F1F3F5] mt-1">
            {p.totalCharactersTyped.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#858B99]">{formatTime(p.totalPracticeSeconds)} spent typing</span>
        </div>
      </div>

      {/* Calendar Heatmap Section (GitHub style) */}
      <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#F1F3F5] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4F36B]" /> Practice Activity Heatmap
          </h2>
          <span className="text-xs text-[#858B99]">Past 60 Days</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[600px]">
            {calendarDays.map((cd) => {
              let levelClass = "bg-[#0D0F14] border-[#262B38]";
              if (cd.seconds > 1200) levelClass = "bg-[#D4F36B] border-[#D4F36B]";
              else if (cd.seconds > 600) levelClass = "bg-[#D4F36B]/70 border-[#D4F36B]/60";
              else if (cd.seconds > 180) levelClass = "bg-[#D4F36B]/40 border-[#D4F36B]/30";
              else if (cd.seconds > 0) levelClass = "bg-[#D4F36B]/20 border-[#D4F36B]/20";

              return (
                <div
                  key={cd.date}
                  title={`${cd.date}: ${Math.round(cd.seconds / 60)} minutes practiced`}
                  className={cn("w-3.5 h-3.5 rounded-sm border transition-all cursor-pointer", levelClass)}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 text-[10px] text-[#858B99] pt-1">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#0D0F14] border border-[#262B38]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D4F36B]/20" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D4F36B]/40" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D4F36B]/70" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D4F36B]" />
          <span>More</span>
        </div>
      </div>

      {/* Weak Keys & Targeted Training Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F1F3F5] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Weak Key Diagnostics
            </h2>
            <Link
              href="/practice"
              className="text-xs text-[#D4F36B] hover:underline font-semibold flex items-center gap-1"
            >
              Drill Weak Keys <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-[#858B99]">
            Keys with the highest error frequency based on real mistakes made during your sessions.
          </p>

          {weakKeys.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
              {weakKeys.map((wk) => (
                <div
                  key={wk.character}
                  className="p-3 rounded-xl bg-[#0D0F14] border border-[#262B38] flex flex-col items-center text-center gap-1"
                >
                  <span className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 font-mono font-bold text-red-300 flex items-center justify-center text-base">
                    {wk.character === " " ? "␣" : wk.character}
                  </span>
                  <span className="text-xs font-semibold text-[#F1F3F5]">{wk.accuracy}% Acc</span>
                  <span className="text-[10px] text-[#858B99]">{wk.errors} errors</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-[#262B38] rounded-xl flex flex-col items-center justify-center text-center gap-2 text-xs text-[#858B99]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <span className="font-semibold text-[#F1F3F5]">No frequent error patterns detected!</span>
              <span>Keep practicing and any problematic keys will automatically appear here.</span>
            </div>
          )}
        </div>

        {/* Milestone Achievements */}
        <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F1F3F5] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#8B7CFF]" /> Milestones & Badges
            </h2>
            <span className="text-xs text-[#858B99]">Touch Typing Honors</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            {[
              {
                title: "First Step",
                desc: "Complete 1st typing lesson",
                unlocked: p.lessonsCompleted >= 1,
              },
              {
                title: "Home Row Pro",
                desc: "Complete 5 lessons",
                unlocked: p.lessonsCompleted >= 5,
              },
              {
                title: "Velocity 40",
                desc: "Reach 40 WPM",
                unlocked: p.bestWpm >= 40,
              },
              {
                title: "Velocity 60",
                desc: "Reach 60 WPM",
                unlocked: p.bestWpm >= 60,
              },
              {
                title: "Precision Strike",
                desc: "Attain 95%+ accuracy",
                unlocked: p.averageAccuracy >= 95,
              },
              {
                title: "Dedicated Typist",
                desc: "3-day practice streak",
                unlocked: p.currentStreak >= 3,
              },
            ].map((ach, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-xl border flex flex-col gap-1 transition-all",
                  ach.unlocked
                    ? "bg-[#0D0F14] border-[#D4F36B]/40 text-[#F1F3F5]"
                    : "bg-[#0D0F14]/40 border-[#262B38] opacity-50 text-[#858B99]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{ach.title}</span>
                  {ach.unlocked ? (
                    <Award className="w-4 h-4 text-[#D4F36B]" />
                  ) : (
                    <span className="text-[10px] text-[#858B99]">Locked</span>
                  )}
                </div>
                <span className="text-[10px] text-[#858B99]">{ach.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

