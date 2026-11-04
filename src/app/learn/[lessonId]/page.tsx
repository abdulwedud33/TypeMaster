"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TypingEngine } from "@/components/typing-engine";
import { TypingResultData } from "@/components/results-modal";
import { getFingerForKey } from "@/lib/typing-utils";
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonData {
  id: string;
  level: number;
  orderIndex: number;
  title: string;
  description: string;
  lessonType: string;
  targetKeys: string;
  fingerNotes: string;
  exercises: string[];
}

export default function LessonRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [lastAttemptAccuracy, setLastAttemptAccuracy] = useState<number | null>(null);
  const [showTutorTip, setShowTutorTip] = useState(true);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data.lesson);
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4F36B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#858B99]">Preparing exercise arena...</span>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-4">
        <h2 className="text-xl font-bold text-[#F1F3F5]">Lesson Not Found</h2>
        <Link
          href="/learn"
          className="px-4 py-2 rounded-xl bg-[#D4F36B] text-[#0D0F14] text-xs font-bold"
        >
          Return to Curriculum
        </Link>
      </div>
    );
  }

  const currentExercise =
    lesson.exercises && lesson.exercises.length > 0
      ? lesson.exercises[currentExerciseIndex]
      : "practice text";

  const totalExercises = lesson.exercises?.length || 1;
  const isLastExercise = currentExerciseIndex >= totalExercises - 1;

  // Split target keys into visual badge items
  const keyTokens = lesson.targetKeys
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k && k !== "all_home_row" && k !== "top_and_home_rows" && k !== "all_26_letters" && k !== "all");

  const handleExerciseComplete = (results: TypingResultData) => {
    setLastAttemptAccuracy(results.accuracy);

    // If passed with at least 90% accuracy, proceed to next step
    if (results.accuracy >= 90) {
      if (!isLastExercise) {
        setTimeout(() => {
          setCurrentExerciseIndex((prev) => prev + 1);
          setLastAttemptAccuracy(null);
        }, 1500);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-8 flex flex-col gap-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#858B99] hover:text-[#F1F3F5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Curriculum
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#13161F] border border-[#1E2333] text-[#D4F36B]">
            Level {lesson.level} • Lesson {lesson.orderIndex}
          </span>
        </div>
      </div>

      {/* Lesson Header Information Card */}
      <div className="p-6 rounded-3xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl font-black text-[#F1F3F5] tracking-tight">{lesson.title}</h1>
          <span className="text-xs font-mono font-bold text-[#8B7CFF] px-2.5 py-1 rounded-xl bg-[#8B7CFF]/10 border border-[#8B7CFF]/20 self-start sm:self-auto">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#858B99] leading-relaxed">
          {lesson.description}
        </p>

        {/* Step indicator progress pills */}
        <div className="flex items-center gap-1.5 pt-1">
          {lesson.exercises.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentExerciseIndex
                  ? "w-8 bg-[#D4F36B]"
                  : idx < currentExerciseIndex
                  ? "w-3 bg-emerald-500"
                  : "w-3 bg-[#1E2333]"
              )}
            />
          ))}
        </div>

        {/* Finger Placement Guidance Banner */}
        {lesson.fingerNotes && (
          <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex items-start gap-3 text-xs text-[#858B99]">
            <HelpCircle className="w-4 h-4 text-[#D4F36B] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[#F1F3F5] font-bold">Finger Placement Guide</span>
              <span className="leading-relaxed">{lesson.fingerNotes}</span>
            </div>
          </div>
        )}

        {/* Target Keys Badges */}
        {keyTokens.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1E2333]/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#858B99]">
              Keys in this drill:
            </span>
            <div className="flex flex-wrap gap-2">
              {keyTokens.map((keyChar) => {
                const finger = getFingerForKey(keyChar);
                return (
                  <div
                    key={keyChar}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#090A0F] border border-[#1E2333] text-xs font-mono"
                  >
                    <span className="font-bold text-[#F1F3F5]">
                      {keyChar === " " || keyChar.toLowerCase() === "space" ? "␣ Space" : keyChar}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shadow-sm"
                      style={{ backgroundColor: finger.color }}
                      title={finger.label}
                    />
                    <span className="text-[10px] text-[#858B99] hidden sm:inline">
                      {finger.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Performance-based Tutor Feedback */}
        {lastAttemptAccuracy !== null && (
          <div
            className={cn(
              "p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200",
              lastAttemptAccuracy >= 90
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            )}
          >
            <div className="flex items-center gap-2">
              {lastAttemptAccuracy >= 90 ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>
                {lastAttemptAccuracy >= 90
                  ? `⭐ Great Accuracy (${lastAttemptAccuracy}%)! Progressing to next step.`
                  : `Needs Practice (${lastAttemptAccuracy}%). In touch typing, speed comes from accuracy. Repeat this exercise focusing on hitting the right key every time.`}
              </span>
            </div>

            {lastAttemptAccuracy < 90 && (
              <button
                onClick={() => setLastAttemptAccuracy(null)}
                className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition-colors shrink-0"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Core Typing Engine Runner */}
      <TypingEngine
        key={`${lesson.id}_${currentExerciseIndex}`}
        initialText={currentExercise}
        sessionType="lesson"
        lessonId={lesson.id}
        onComplete={handleExerciseComplete}
        showKeyboardToggle={true}
      />
    </div>
  );
}
