"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Target,
  Clock,
  BookOpen,
  Trophy,
  Flame,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  PlaySquare,
  BarChart3,
  Calendar,
  Sparkles,
} from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";

interface DashboardData {
  user: { id: string; name: string; email: string; isDemo?: boolean } | null;
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
  recentSessions: Array<{
    id?: string;
    sessionType: string;
    wpm: number;
    accuracy: number;
    durationSeconds: number;
    completedAt: string;
  }>;
  weeklyActivity: Array<{
    activityDate: string;
    practiceSeconds: number;
    charactersTyped: number;
    lessonsCompleted: number;
    testsCompleted: number;
  }>;
  recommendedLesson?: {
    id: string;
    level: number;
    title: string;
    description: string;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/stats/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4F36B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#858B99]">Loading your personal metrics...</span>
        </div>
      </div>
    );
  }

  const progress = data?.progress || {
    currentLevel: 1,
    lessonsCompleted: 0,
    totalPracticeSeconds: 0,
    totalCharactersTyped: 0,
    bestWpm: 0,
    averageAccuracy: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  const hasData = progress.totalPracticeSeconds > 0 || progress.lessonsCompleted > 0;
  const totalWords = Math.round(progress.totalCharactersTyped / 5);
  const dailyGoalMinutes = 15;
  const todaySeconds =
    data?.weeklyActivity?.[data.weeklyActivity.length - 1]?.practiceSeconds || 0;
  const todayMinutes = Math.round(todaySeconds / 60);
  const goalPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  return (
    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#D4F36B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4F36B]/15 text-[#D4F36B] text-[11px] font-bold border border-[#D4F36B]/30 uppercase tracking-wider">
              Level {progress.currentLevel} Typist
            </span>
            {progress.currentStreak > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> {progress.currentStreak} Day Streak
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F3F5] tracking-tight">
            Welcome back, {data?.user?.name || "Abdulwedud"}!
          </h1>
          <p className="text-xs sm:text-sm text-[#858B99] max-w-xl">
            {hasData
              ? `You have completed ${progress.lessonsCompleted} lessons and typed ${progress.totalCharactersTyped.toLocaleString()} verified characters. Ready for today's drill?`
              : "Begin with Level 1 to master the tactile bumps on anchor keys F and J and establish proper touch typing posture."}
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link
            href={data?.recommendedLesson ? `/learn/${data.recommendedLesson.id}` : "/learn"}
            className="px-5 py-2.5 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4F36B]/20 flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" /> Continue Learning
          </Link>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Speed */}
        <div className="p-5 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-1 hover:border-[#1E2333]/90 transition-colors">
          <div className="flex items-center justify-between text-[#858B99]">
            <span className="text-xs font-semibold">Best Speed</span>
            <div className="w-7 h-7 rounded-lg bg-[#D4F36B]/10 flex items-center justify-center text-[#D4F36B]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black font-mono text-[#D4F36B]">
              {progress.bestWpm > 0 ? progress.bestWpm : 0}
            </span>
            <span className="text-xs text-[#858B99] font-medium">WPM</span>
          </div>
          <span className="text-[11px] text-[#858B99] mt-1">
            {progress.bestWpm > 0 ? "Top verified velocity" : "Take a test to record WPM"}
          </span>
        </div>

        {/* Accuracy */}
        <div className="p-5 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-1 hover:border-[#1E2333]/90 transition-colors">
          <div className="flex items-center justify-between text-[#858B99]">
            <span className="text-xs font-semibold">Lifetime Accuracy</span>
            <div className="w-7 h-7 rounded-lg bg-[#8B7CFF]/10 flex items-center justify-center text-[#8B7CFF]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black font-mono text-[#F1F3F5]">
              {progress.averageAccuracy > 0 ? `${progress.averageAccuracy}%` : "—"}
            </span>
          </div>
          <span className="text-[11px] text-[#858B99] mt-1">
            {progress.averageAccuracy > 0 ? "Across all sessions" : "Target: 95%+ accuracy"}
          </span>
        </div>

        {/* Lessons Completed */}
        <div className="p-5 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-1 hover:border-[#1E2333]/90 transition-colors">
          <div className="flex items-center justify-between text-[#858B99]">
            <span className="text-xs font-semibold">Lessons Mastered</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black font-mono text-[#F1F3F5]">
              {progress.lessonsCompleted}
            </span>
            <span className="text-xs text-[#858B99] font-medium">/ 29</span>
          </div>
          <span className="text-[11px] text-[#858B99] mt-1">10 progressive levels</span>
        </div>

        {/* Practice Time */}
        <div className="p-5 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-1 hover:border-[#1E2333]/90 transition-colors">
          <div className="flex items-center justify-between text-[#858B99]">
            <span className="text-xs font-semibold">Time Practicing</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black font-mono text-[#F1F3F5]">
              {formatTime(progress.totalPracticeSeconds)}
            </span>
          </div>
          <span className="text-[11px] text-[#858B99] mt-1">
            {totalWords.toLocaleString()} words typed
          </span>
        </div>
      </div>

      {/* Recommended Lesson & Daily Target Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Lesson */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#858B99] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#D4F36B]" /> Recommended Drill
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0D0F14] text-[#D4F36B] border border-[#1E2333]">
              Level {data?.recommendedLesson?.level || 1}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#F1F3F5]">
              {data?.recommendedLesson?.title || "Level 1: Anchor Keys F & J"}
            </h3>
            <p className="text-xs text-[#858B99] mt-1.5 leading-relaxed">
              {data?.recommendedLesson?.description ||
                "Locate the raised physical dots on F and J with your index fingers to ground your muscle memory."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#1E2333]">
            <span className="text-xs text-[#858B99]">Estimated duration: ~3 mins</span>
            <Link
              href={data?.recommendedLesson ? `/learn/${data.recommendedLesson.id}` : "/learn"}
              className="px-4 py-2 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              Start Drill <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="p-6 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#858B99] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#8B7CFF]" /> Daily Commitment
            </span>
            <span className="text-xs text-[#858B99] font-mono">Target: {dailyGoalMinutes}m</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-[#F1F3F5]">{todayMinutes}m</span>
              <span className="text-xs font-bold text-[#8B7CFF]">{goalPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#0D0F14] border border-[#1E2333] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-[#8B7CFF] transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#858B99]">
            {todayMinutes >= dailyGoalMinutes
              ? "Goal unlocked for today! Great dedication."
              : `${dailyGoalMinutes - todayMinutes} more minutes to reach your target.`}
          </p>
        </div>
      </div>

      {/* Activity & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F1F3F5] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#D4F36B]" /> Weekly Activity Volume
            </h3>
            <span className="text-xs text-[#858B99]">Last 7 days</span>
          </div>

          {data?.weeklyActivity && data.weeklyActivity.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-[#1E2333]">
              {data.weeklyActivity.map((day) => {
                const heightPercent = Math.min(100, Math.max(8, (day.practiceSeconds / 900) * 100));
                return (
                  <div key={day.activityDate} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full max-w-[36px] flex items-end justify-center h-28">
                      <div
                        className="w-full rounded-t-lg bg-[#D4F36B]/80 hover:bg-[#D4F36B] transition-all"
                        style={{ height: `${heightPercent}%` }}
                        title={`${day.activityDate}: ${Math.round(day.practiceSeconds / 60)} mins`}
                      />
                    </div>
                    <span className="text-[10px] text-[#858B99] font-mono">
                      {day.activityDate.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#1E2333] rounded-xl text-[#858B99] text-xs">
              <BarChart3 className="w-6 h-6 opacity-30 mb-2" />
              <span>No activity recorded in the past 7 days.</span>
              <span className="mt-1 text-[#D4F36B]">Complete your first exercise to see momentum!</span>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="p-6 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F1F3F5] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8B7CFF]" /> Recent Sessions
            </h3>
            <Link href="/progress" className="text-xs text-[#8B7CFF] hover:underline font-semibold">
              View All
            </Link>
          </div>

          {data?.recentSessions && data.recentSessions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.recentSessions.slice(0, 5).map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0D0F14] border border-[#1E2333] flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#F1F3F5] capitalize">
                      {s.sessionType.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-[#858B99]">{formatDate(s.completedAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="font-mono font-bold text-[#D4F36B]">{s.wpm} WPM</span>
                    <span className="font-mono text-[#858B99]">{s.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#1E2333] rounded-xl text-[#858B99] text-xs">
              <span>No recent typing sessions found.</span>
              <Link href="/learn" className="mt-2 text-xs font-bold text-[#D4F36B] hover:underline">
                Start First Lesson →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
