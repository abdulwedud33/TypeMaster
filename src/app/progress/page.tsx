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
  heatmapActivity: any[];
  weakKeys: any[];
  unlockedAchievements: string[];
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/stats/progress");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Progress fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4F36B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#858B99]">Loading your personal metrics from database...</span>
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

  const weakKeys = data?.weakKeys || [];
  const unlockedAchievements = new Set(data?.unlockedAchievements || []);

  // Filter recent sessions based on selected timeFilter
  const now = Date.now();
  const filterCutoff = {
    "7d": now - 7 * 86400000,
    "30d": now - 30 * 86400000,
    "90d": now - 90 * 86400000,
    all: 0,
  }[timeFilter];

  const filteredSessions = (data?.recentSessions || []).filter((s) => {
    if (!s.completedAt) return true;
    return new Date(s.completedAt).getTime() >= filterCutoff;
  });

  // Generate GitHub-style 60-day calendar contribution heatmap
  const today = new Date();
  const calendarDays = [];
  for (let i = 59; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const activity = data?.heatmapActivity?.find((w) => w.activityDate === dateStr);
    const count = activity?.practiceSeconds || 0;
    calendarDays.push({ date: dateStr, seconds: count });
  }

  const MILESTONE_DEFINITIONS = [
    { id: "first_lesson", title: "First Step", desc: "Complete 1st typing lesson", condition: p.lessonsCompleted >= 1 },
    { id: "five_lessons", title: "Habit Builder", desc: "Complete 5 lessons", condition: p.lessonsCompleted >= 5 },
    { id: "wpm_30", title: "Swift Typist", desc: "Reach 30 WPM", condition: p.bestWpm >= 30 },
    { id: "wpm_50", title: "Speed Typist", desc: "Reach 50 WPM", condition: p.bestWpm >= 50 },
    { id: "accuracy_95", title: "Precision Strike", desc: "Attain 95%+ accuracy", condition: p.averageAccuracy >= 95 },
    { id: "streak_3", title: "Consistent Mind", desc: "Maintain a 3-day practice streak", condition: p.currentStreak >= 3 },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2333] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13161F] border border-[#1E2333] text-xs font-semibold text-[#8B7CFF] mb-2">
            <LineChart className="w-3.5 h-3.5" />
            <span>Verified Database Analytics</span>
          </div>
          <h1 className="text-3xl font-black text-[#F1F3F5] tracking-tight">Progress & Analytics</h1>
          <p className="text-xs sm:text-sm text-[#858B99] mt-1">
            Real performance records, weak keys, daily streaks, and lifetime milestone achievements.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#13161F] border border-[#1E2333] self-start sm:self-auto">
          {(["7d", "30d", "90d", "all"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all uppercase font-mono",
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

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-1">
          <span className="text-xs text-[#858B99] font-medium flex items-center justify-between">
            Personal Best <Zap className="w-4 h-4 text-[#D4F36B]" />
          </span>
          <span className="text-3xl font-black font-mono text-[#D4F36B] mt-1">
            {p.bestWpm} WPM
          </span>
          <span className="text-[11px] text-[#858B99]">Top verified speed record</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-1">
          <span className="text-xs text-[#858B99] font-medium flex items-center justify-between">
            Lifetime Accuracy <Target className="w-4 h-4 text-[#8B7CFF]" />
          </span>
          <span className="text-3xl font-black font-mono text-[#F1F3F5] mt-1">
            {p.averageAccuracy}%
          </span>
          <span className="text-[11px] text-[#858B99]">Mean across all keystrokes</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-1">
          <span className="text-xs text-[#858B99] font-medium flex items-center justify-between">
            Active / Best Streak <Flame className="w-4 h-4 text-amber-400" />
          </span>
          <span className="text-3xl font-black font-mono text-[#F1F3F5] mt-1">
            {p.currentStreak} <span className="text-sm font-normal text-[#858B99]">/ {p.longestStreak} d</span>
          </span>
          <span className="text-[11px] text-[#858B99]">Consecutive practice days</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-1">
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
      <div className="p-6 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#F1F3F5] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4F36B]" /> Practice Activity Heatmap
          </h2>
          <span className="text-xs text-[#858B99]">Past 60 Days</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[600px]">
            {calendarDays.map((cd) => {
              let levelClass = "bg-[#090A0F] border-[#1E2333]";
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
          <div className="w-2.5 h-2.5 rounded-sm bg-[#090A0F] border border-[#1E2333]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D4F36B]/20" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D4F36B]/40" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D4F36B]/70" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#D4F36B]" />
          <span>More</span>
        </div>
      </div>

      {/* Weak Keys & Milestone Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F1F3F5] flex items-center gap-2">
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
              {weakKeys.map((wk: any) => (
                <div
                  key={wk.character}
                  className="p-3 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col items-center text-center gap-1"
                >
                  <span className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 font-mono font-bold text-red-300 flex items-center justify-center text-base">
                    {wk.character === " " ? "␣" : wk.character}
                  </span>
                  <span className="text-xs font-semibold text-[#F1F3F5]">{wk.accuracy}% Acc</span>
                  <span className="text-[10px] text-[#858B99]">{wk.errors} errors</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-[#1E2333] rounded-2xl flex flex-col items-center justify-center text-center gap-2 text-xs text-[#858B99]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <span className="font-semibold text-[#F1F3F5]">No frequent error patterns detected!</span>
              <span>Keep practicing and any problematic keys will automatically appear here.</span>
            </div>
          )}
        </div>

        {/* Milestone Achievements */}
        <div className="p-6 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F1F3F5] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#8B7CFF]" /> Milestones & Badges
            </h2>
            <span className="text-xs text-[#858B99]">Touch Typing Honors</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            {MILESTONE_DEFINITIONS.map((ach) => {
              const isUnlocked = ach.condition || unlockedAchievements.has(ach.id);
              return (
                <div
                  key={ach.id}
                  className={cn(
                    "p-3 rounded-2xl border flex flex-col gap-1 transition-all",
                    isUnlocked
                      ? "bg-[#090A0F] border-[#D4F36B]/40 text-[#F1F3F5]"
                      : "bg-[#090A0F]/40 border-[#1E2333] opacity-50 text-[#858B99]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{ach.title}</span>
                    {isUnlocked ? (
                      <Award className="w-4 h-4 text-[#D4F36B]" />
                    ) : (
                      <span className="text-[10px] text-[#858B99]">Locked</span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#858B99]">{ach.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
