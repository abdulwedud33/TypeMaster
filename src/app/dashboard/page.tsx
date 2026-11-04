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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4F36B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#858B99]">Loading your dashboard...</span>
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
  const todaySeconds = data?.weeklyActivity?.[data.weeklyActivity.length - 1]?.practiceSeconds || 0;
  const todayMinutes = Math.round(todaySeconds / 60);
  const goalPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171A23] via-[#1E222E] to-[#171A23] border border-[#262B38] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#D4F36B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4F36B]/15 text-[#D4F36B] text-xs font-bold border border-[#D4F36B]/30">
              Level {progress.currentLevel} Typist
            </span>
            {progress.currentStreak > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> {progress.currentStreak} Day Streak!
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F3F5]">
            Welcome back, {data?.user?.name || "Abdulwedud"}!
          </h1>
          <p className="text-xs sm:text-sm text-[#858B99] max-w-xl">
            {hasData
              ? `You've completed ${progress.lessonsCompleted} lessons and typed ${progress.totalCharactersTyped.toLocaleString()} characters so far. Ready for the next drill?`
              : "Ready to start your touch-typing journey? Begin with Level 1 to master the home row anchor keys."}
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link
            href={data?.recommendedLesson ? `/learn/${data.recommendedLesson.id}` : "/learn"}
            className="px-6 py-3 rounded-2xl bg-[#D4F36B] text-[#0D0F14] font-bold text-sm hover:bg-[#bde050] transition-all shadow-lg shadow-[#D4F36B]/25 flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" /> Continue Learning
          </Link>
        </div>
      </div>

      {/* Main Metrics 4-Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Speed */}
        <div className="p-5 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#858B99]">
            <span className="text-xs font-semibold">Best Typing Speed</span>
            <Zap className="w-4 h-4 text-[#D4F36B]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-[#D4F36B]">
              {progress.bestWpm > 0 ? progress.bestWpm : 0}
            </span>
            <span className="text-xs text-[#858B99]">WPM</span>
          </div>
          <span className="text-[11px] text-[#858B99] mt-1">
            {progress.bestWpm > 0 ? "Highest verified speed" : "Complete a test to set a record"}
          </span>
        </div>

        {/* Accuracy */}
        <div className="p-5 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#858B99]">
            <span className="text-xs font-semibold">Average Accuracy</span>
            <Target className="w-4 h-4 text-[#8B7CFF]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-[#F1F3F5]">
              {progress.averageAccuracy > 0 ? `${progress.averageAccuracy}%` : "—"}
            </span>
          </div>
          <span className="text-[11px] text-[#858B99] mt-1">
            {progress.averageAccuracy > 0 ? "Across all sessions" : "Target: 95%+ precision"}
          </span>
        </div>

        {/* Lessons Completed */}
        <div className="p-5 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#858B99]">
            <span className="text-xs font-semibold">Lessons Mastered</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-[#F1F3F5]">
              {progress.lessonsCompleted}
            </span>
            <span className="text-xs text-[#858B99]">/ 29</span>
          </div>
          <span className="text-[11px] text-[#858B99] mt-1">10 levels in curriculum</span>
        </div>

        {/* Practice Time */}
        <div className="p-5 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#858B99]">
            <span className="text-xs font-semibold">Practice Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-[#F1F3F5]">
              {formatTime(progress.totalPracticeSeconds)}
            </span>
          </div>
          <span className="text-[11px] text-[#858B99] mt-1">
            {totalWords.toLocaleString()} total words typed
          </span>
        </div>
      </div>

      {/* Recommended Lesson & Daily Goal Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Lesson Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#858B99] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#D4F36B]" /> Recommended Next Lesson
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0D0F14] text-[#D4F36B] border border-[#262B38]">
              Level {data?.recommendedLesson?.level || 1}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#F1F3F5]">
              {data?.recommendedLesson?.title || "Level 1: Anchor Keys F & J"}
            </h3>
            <p className="text-xs sm:text-sm text-[#858B99] mt-2 leading-relaxed">
              {data?.recommendedLesson?.description ||
                "Feel the tactile bumps on F and J to establish your primary touch-typing anchors."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#262B38]/60">
            <span className="text-xs text-[#858B99]">Estimated time: ~3 mins</span>
            <Link
              href={data?.recommendedLesson ? `/learn/${data.recommendedLesson.id}` : "/learn"}
              className="px-4 py-2 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              Start Lesson <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#858B99] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#8B7CFF]" /> Daily Goal
            </span>
            <span className="text-xs text-[#858B99]">Target: {dailyGoalMinutes}m</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-[#F1F3F5]">{todayMinutes}m</span>
              <span className="text-xs font-semibold text-[#8B7CFF]">{goalPercent}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[#0D0F14] border border-[#262B38] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-[#8B7CFF] transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#858B99]">
            {todayMinutes >= dailyGoalMinutes
              ? "Awesome work! You've achieved your daily practice goal today!"
              : `${dailyGoalMinutes - todayMinutes} more minutes to hit your goal today.`}
          </p>
        </div>
      </div>

      {/* Activity & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F1F3F5] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#D4F36B]" /> Weekly Typing Activity
            </h3>
            <span className="text-xs text-[#858B99]">Last 7 days</span>
          </div>

          {data?.weeklyActivity && data.weeklyActivity.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-44 pt-4 border-b border-[#262B38]">
              {data.weeklyActivity.map((day) => {
                const heightPercent = Math.min(100, Math.max(8, (day.practiceSeconds / 900) * 100));
                return (
                  <div key={day.activityDate} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full max-w-[40px] flex items-end justify-center h-32">
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
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#262B38] rounded-xl text-[#858B99] text-xs">
              <BarChart3 className="w-8 h-8 opacity-40 mb-2" />
              <span>No practice activity recorded in the past 7 days.</span>
              <span className="mt-1 text-[#D4F36B]">Complete a lesson to see your weekly momentum!</span>
            </div>
          )}
        </div>

        {/* Recent Sessions List */}
        <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F1F3F5] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8B7CFF]" /> Recent Sessions
            </h3>
            <Link href="/progress" className="text-xs text-[#8B7CFF] hover:underline font-semibold">
              View All
            </Link>
          </div>

          {data?.recentSessions && data.recentSessions.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {data.recentSessions.slice(0, 5).map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0D0F14] border border-[#262B38] flex items-center justify-between text-xs"
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
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#262B38] rounded-xl text-[#858B99] text-xs">
              <span>No recent typing sessions found.</span>
              <Link
                href="/learn"
                className="mt-2 text-xs font-bold text-[#D4F36B] hover:underline"
              >
                Start First Lesson →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

