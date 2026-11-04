"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TypingEngine } from "@/components/typing-engine";
import { TypingResultData } from "@/components/results-modal";
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  HelpCircle,
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

  const handleExerciseComplete = (results: TypingResultData) => {
    if (!isLastExercise) {
      setTimeout(() => {
        setCurrentExerciseIndex((prev) => prev + 1);
      }, 1200);
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
      <div className="p-6 rounded-2xl bg-[#13161F] border border-[#1E2333] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#F1F3F5]">{lesson.title}</h1>
          <span className="text-xs font-mono font-bold text-[#8B7CFF]">
            Step {currentExerciseIndex + 1} of {totalExercises}
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

        {lesson.fingerNotes && (
          <div className="mt-2 p-3 rounded-xl bg-[#090A0F] border border-[#1E2333] flex items-center gap-2.5 text-xs text-[#858B99]">
            <HelpCircle className="w-4 h-4 text-[#8B7CFF] shrink-0" />
            <span>
              <strong className="text-[#F1F3F5]">Finger Position: </strong>
              {lesson.fingerNotes}
            </span>
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
