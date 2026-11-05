"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TypingEngine } from "@/components/typing-engine";
import { TypingResultData } from "@/components/results-modal";
import { getFingerForKey, calculateWpm } from "@/lib/typing-utils";
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  ShieldCheck,
  Lock,
  Trophy,
  Check,
  Delete,
  Flame,
  Volume2,
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
  nextLessonId?: string | null;
  nextLessonTitle?: string | null;
  nextLessonLevel?: number | null;
  isLastLessonOfLevel?: boolean;
}

export default function LessonRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isLevelUnlocked, setIsLevelUnlocked] = useState<boolean>(true);
  const [isLessonUnlocked, setIsLessonUnlocked] = useState<boolean>(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [attemptKey, setAttemptKey] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Exercise & Lesson completion state
  const [exerciseResult, setExerciseResult] = useState<TypingResultData | null>(null);
  const [lessonResult, setLessonResult] = useState<TypingResultData | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownAction, setCountdownAction] = useState<
    "next_exercise" | "retry_exercise" | "next_lesson" | "retry_lesson" | null
  >(null);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data.lesson);
          setIsLevelUnlocked(data.isLevelUnlocked ?? true);
          setIsLessonUnlocked(data.isLessonUnlocked ?? true);
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [lessonId]);

  // Countdown timer hook for automatic navigation & retry
  useEffect(() => {
    if (countdown === null || isTimerPaused) return;

    if (countdown <= 0) {
      if (countdownAction === "next_exercise") {
        setExerciseResult(null);
        setCountdown(null);
        setCountdownAction(null);
        setCurrentExerciseIndex((prev) => prev + 1);
        setAttemptKey((k) => k + 1);
      } else if (countdownAction === "retry_exercise") {
        setExerciseResult(null);
        setCountdown(null);
        setCountdownAction(null);
        setAttemptKey((k) => k + 1);
      } else if (countdownAction === "next_lesson") {
        if (lesson?.nextLessonId) {
          router.push(`/learn/${lesson.nextLessonId}`);
        } else {
          router.push("/learn");
        }
      } else if (countdownAction === "retry_lesson") {
        setLessonResult(null);
        setCountdown(null);
        setCountdownAction(null);
        setCurrentExerciseIndex(0);
        setAttemptKey((k) => k + 1);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, countdownAction, isTimerPaused, lesson, router]);

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

  // Level or Lesson Locked Guard
  if (!isLevelUnlocked || !isLessonUnlocked) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#F1F3F5]">
          {!isLevelUnlocked ? `Level ${lesson.level} is Locked` : `Lesson ${lesson.orderIndex} is Locked`}
        </h2>
        <p className="text-xs sm:text-sm text-[#858B99] leading-relaxed max-w-md">
          {!isLevelUnlocked
            ? `You must complete all lessons in Level ${lesson.level - 1} with at least 90% accuracy before you can access this level.`
            : `You must complete previous lessons with at least 90% accuracy to unlock this lesson. Sequential progression builds reliable finger muscle memory.`}
        </p>
        <Link
          href="/learn"
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] text-xs font-bold transition-all shadow-md shadow-[#D4F36B]/20"
        >
          Return to Unlocked Lessons
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
    .filter(
      (k) =>
        k &&
        k !== "all_home_row" &&
        k !== "top_and_home_rows" &&
        k !== "all_26_letters" &&
        k !== "all"
    );

  // Exercise and Lesson completion handler
  const handleEngineComplete = async (results: TypingResultData) => {
    if (!isLastExercise) {
      // Sub-exercise completion (drills 1 through 4)
      setExerciseResult(results);
      if (results.accuracy >= 90) {
        setCountdown(3);
        setCountdownAction("next_exercise");
      } else {
        setCountdown(4);
        setCountdownAction("retry_exercise");
      }
    } else {
      // Final exercise completion (drill 5) -> Completes whole lesson
      setLessonResult(results);

      // Save lesson attempt in database
      try {
        await fetch("/api/lessons/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(results),
        });
      } catch (err) {
        console.error("Failed to save lesson attempt:", err);
      }

      if (results.accuracy >= 90) {
        setCountdown(4);
        setCountdownAction("next_lesson");
      } else {
        setCountdown(4);
        setCountdownAction("retry_lesson");
      }
    }
  };

  // Immediate action handlers
  const handleImmediateNextExercise = () => {
    setExerciseResult(null);
    setCountdown(null);
    setCountdownAction(null);
    setCurrentExerciseIndex((prev) => prev + 1);
    setAttemptKey((k) => k + 1);
  };

  const handleImmediateRetryExercise = () => {
    setExerciseResult(null);
    setCountdown(null);
    setCountdownAction(null);
    setAttemptKey((k) => k + 1);
  };

  const handleImmediateNextLesson = () => {
    if (lesson?.nextLessonId) {
      router.push(`/learn/${lesson.nextLessonId}`);
    } else {
      router.push("/learn");
    }
  };

  const handleImmediateRetryLesson = () => {
    setLessonResult(null);
    setCountdown(null);
    setCountdownAction(null);
    setCurrentExerciseIndex(0);
    setAttemptKey((k) => k + 1);
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

        {/* Real-time Exercise Result Feedback Banner (for sub-exercises 1 to 4) */}
        {exerciseResult && (
          <div
            className={cn(
              "p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200 shadow-lg",
              exerciseResult.accuracy >= 90
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            )}
          >
            <div className="flex items-start sm:items-center gap-3">
              {exerciseResult.accuracy >= 90 ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#F1F3F5]">
                    {exerciseResult.accuracy >= 90
                      ? `Exercise ${currentExerciseIndex + 1} Passed!`
                      : `Try Again (Accuracy Below 90%)`}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#090A0F] text-xs font-mono font-bold text-[#D4F36B] border border-[#1E2333]">
                    {exerciseResult.wpm} WPM • {exerciseResult.accuracy}% Acc
                  </span>
                </div>
                <p className="text-[11px] text-[#858B99]">
                  {exerciseResult.accuracy >= 90
                    ? `Advancing to next exercise in ${countdown ?? 0}s...`
                    : `In touch typing, accuracy creates speed. Retrying this exercise in ${countdown ?? 0}s...`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {exerciseResult.accuracy >= 90 ? (
                <>
                  <button
                    onClick={handleImmediateRetryExercise}
                    className="px-3 py-1.5 rounded-xl bg-[#090A0F] hover:bg-[#1E2333] text-[#858B99] hover:text-[#F1F3F5] text-xs font-semibold transition-colors flex items-center gap-1.5 border border-[#1E2333]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Replay
                  </button>
                  <button
                    onClick={handleImmediateNextExercise}
                    className="px-4 py-1.5 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] text-xs font-bold transition-all shadow-md shadow-[#D4F36B]/20 flex items-center gap-1.5"
                  >
                    Next ({countdown}s) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleImmediateRetryExercise}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0D0F14] text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Now ({countdown}s)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Core Typing Engine Runner */}
      <TypingEngine
        key={`${lesson.id}_${currentExerciseIndex}_${attemptKey}`}
        initialText={currentExercise}
        sessionType="lesson"
        lessonId={lesson.id}
        onComplete={handleEngineComplete}
        showKeyboardToggle={true}
        showResultsModal={false}
      />

      {/* Full Lesson Completion Modal (Shown after the 5th and final exercise) */}
      {lessonResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-[#13161F] border border-[#1E2333] p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E2333] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center",
                    lessonResult.accuracy >= 90
                      ? "bg-[#D4F36B]/15 border border-[#D4F36B]/30 text-[#D4F36B]"
                      : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                  )}
                >
                  {lessonResult.accuracy >= 90 ? (
                    <Trophy className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F1F3F5]">
                    {lessonResult.accuracy >= 90
                      ? lesson.isLastLessonOfLevel
                        ? `Level ${lesson.level} Completed!`
                        : `Lesson ${lesson.orderIndex} Mastered!`
                      : `Lesson Incomplete`}
                  </h2>
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      lessonResult.accuracy >= 90 ? "text-emerald-400" : "text-amber-400"
                    )}
                  >
                    {lessonResult.accuracy >= 90
                      ? lesson.isLastLessonOfLevel
                        ? `Level ${lesson.level + 1} is now unlocked`
                        : `Target Accuracy Achieved (90%+)`
                      : `Requires 90%+ Accuracy to unlock next lesson`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="text-xs text-[#858B99] hover:text-[#F1F3F5] transition-colors"
                title="Pause or resume auto-advance timer"
              >
                {isTimerPaused ? "Timer Paused" : "Pause Timer"}
              </button>
            </div>

            {/* Performance Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col">
                <span className="text-xs text-[#858B99] font-medium">Speed</span>
                <span className="text-3xl font-black font-mono text-[#D4F36B]">
                  {lessonResult.wpm}
                </span>
                <span className="text-[10px] text-[#858B99]">Net WPM</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col">
                <span className="text-xs text-[#858B99] font-medium">Accuracy</span>
                <span
                  className={cn(
                    "text-3xl font-black font-mono",
                    lessonResult.accuracy >= 90 ? "text-emerald-400" : "text-amber-400"
                  )}
                >
                  {lessonResult.accuracy}%
                </span>
                <span className="text-[10px] text-[#858B99]">
                  {lessonResult.incorrectCharacters} mistakes
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col">
                <span className="text-xs text-[#858B99] font-medium">Gross WPM</span>
                <span className="text-3xl font-black font-mono text-[#8B7CFF]">
                  {lessonResult.grossWpm}
                </span>
                <span className="text-[10px] text-[#858B99]">Raw velocity</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col">
                <span className="text-xs text-[#858B99] font-medium">Time</span>
                <span className="text-3xl font-black font-mono text-[#F1F3F5]">
                  {lessonResult.durationSeconds}s
                </span>
                <span className="text-[10px] text-[#858B99]">
                  {lessonResult.totalKeystrokes} strokes
                </span>
              </div>
            </div>

            {/* Error Breakdown */}
            <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2333] flex flex-col gap-2.5 text-xs text-[#858B99]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct Characters
                </span>
                <span className="font-mono text-[#F1F3F5] font-semibold">
                  {lessonResult.correctCharacters}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Total Mistakes Made
                </span>
                <span className="font-mono text-[#F1F3F5] font-semibold">
                  {lessonResult.incorrectCharacters}
                </span>
              </div>

              {lessonResult.correctedErrors !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-teal-400">
                    <Check className="w-3.5 h-3.5" /> Corrected with Backspace
                  </span>
                  <span className="font-mono text-[#F1F3F5] font-semibold">
                    {lessonResult.correctedErrors}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-[#1E2333]">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Delete className="w-3.5 h-3.5" /> Backspaces Used
                </span>
                <span className="font-mono text-[#F1F3F5] font-semibold">
                  {lessonResult.backspaceCount}
                </span>
              </div>
            </div>

            {/* Mistyped keys list if any */}
            {Object.keys(lessonResult.mistypedKeys || {}).length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-[#858B99] uppercase tracking-wider">
                  Keys to Practice:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(lessonResult.mistypedKeys)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([char, count]) => (
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

            {/* Countdown Notification & Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#1E2333]">
              <div className="text-xs text-[#858B99] text-center sm:text-left">
                {!isTimerPaused && countdown !== null ? (
                  lessonResult.accuracy >= 90 ? (
                    <span>
                      Advancing to{" "}
                      <strong className="text-[#D4F36B]">
                        {lesson.isLastLessonOfLevel
                          ? `Level ${lesson.level + 1}`
                          : lesson.nextLessonTitle || "Next Lesson"}
                      </strong>{" "}
                      in <span className="font-mono font-bold text-[#F1F3F5]">{countdown}s</span>
                    </span>
                  ) : (
                    <span>
                      Accuracy below 90%. Restarting lesson in{" "}
                      <span className="font-mono font-bold text-amber-400">{countdown}s</span>
                    </span>
                  )
                ) : (
                  <span>Timer paused. Choose an option to proceed.</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {lessonResult.accuracy >= 90 ? (
                  <>
                    <button
                      onClick={handleImmediateRetryLesson}
                      className="px-4 py-2.5 rounded-xl bg-[#090A0F] hover:bg-[#1E2333] text-[#F1F3F5] text-xs font-semibold transition-colors flex items-center gap-2 border border-[#1E2333]"
                    >
                      <RotateCcw className="w-4 h-4" /> Replay Lesson
                    </button>
                    <button
                      onClick={handleImmediateNextLesson}
                      className="px-5 py-2.5 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-[#D4F36B]/20 uppercase tracking-wider"
                    >
                      {lesson.isLastLessonOfLevel
                        ? `Enter Level ${lesson.level + 1}`
                        : "Next Lesson"}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/learn"
                      className="px-4 py-2.5 rounded-xl bg-[#090A0F] hover:bg-[#1E2333] text-[#858B99] hover:text-[#F1F3F5] text-xs font-semibold transition-colors flex items-center gap-2 border border-[#1E2333]"
                    >
                      Curriculum
                    </Link>
                    <button
                      onClick={handleImmediateRetryLesson}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0D0F14] text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20 uppercase tracking-wider"
                    >
                      <RotateCcw className="w-4 h-4" /> Retry Lesson Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}