"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { calculateWpm, calculateAccuracy, calculateGrossWpm } from "@/lib/typing-utils";
import { soundManager } from "@/lib/sound";
import { VirtualKeyboard } from "./virtual-keyboard";
import { ResultsModal, TypingResultData } from "./results-modal";
import { RotateCcw, Volume2, VolumeX, Eye, EyeOff, Play, CheckCircle, Flame } from "lucide-react";

export interface TypingEngineProps {
  initialText: string;
  sessionType: "lesson" | "test" | "practice" | "weak_keys" | "custom";
  lessonId?: string;
  durationLimit?: number; // in seconds (for timed tests)
  onComplete?: (results: TypingResultData) => void;
  showKeyboardToggle?: boolean;
}

export function TypingEngine({
  initialText,
  sessionType,
  lessonId,
  durationLimit,
  onComplete,
  showKeyboardToggle = true,
}: TypingEngineProps) {
  // State
  const [text, setText] = useState<string>(initialText.trim());
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastPressedKey, setLastPressedKey] = useState<string | undefined>(undefined);
  const [isLastError, setIsLastError] = useState<boolean>(false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [showFingerGuide, setShowFingerGuide] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [resultsData, setResultsData] = useState<TypingResultData | null>(null);

  // Statistics trackers
  const totalKeystrokesRef = useRef<number>(0);
  const backspaceCountRef = useRef<number>(0);
  const mistypedKeysRef = useRef<Record<string, number>>({});
  const correctKeysRef = useRef<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize initial text if changed
  useEffect(() => {
    setText(initialText.trim());
    resetSession();
  }, [initialText]);

  // Focus input automatically
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, []);

  // Timer loop
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diffSecs = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(diffSecs);

        if (durationLimit && diffSecs >= durationLimit) {
          handleSessionEnd();
        }
      }, 250);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted, durationLimit]);

  // Real-time metrics
  const currentIndex = typedChars.length;
  const currentExpectedChar = currentIndex < text.length ? text[currentIndex] : undefined;

  let correctCount = 0;
  let incorrectCount = 0;
  for (let i = 0; i < typedChars.length; i++) {
    if (typedChars[i] === text[i]) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  }

  const effectiveSeconds = Math.max(1, elapsedSeconds);
  const currentWpm = calculateWpm(correctCount, effectiveSeconds);
  const currentGrossWpm = calculateGrossWpm(totalKeystrokesRef.current, effectiveSeconds);
  const currentAccuracy = calculateAccuracy(correctCount, totalKeystrokesRef.current);

  const isCurrentPositionError =
    currentIndex > 0 && typedChars[currentIndex - 1] !== text[currentIndex - 1];

  // Finish session
  const handleSessionEnd = useCallback(() => {
    if (isCompleted) return;
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    soundManager.playSuccess();

    const duration = Math.max(1, elapsedSeconds);
    const finalWpm = calculateWpm(correctCount, duration);
    const finalGrossWpm = calculateGrossWpm(totalKeystrokesRef.current, duration);
    const finalAccuracy = calculateAccuracy(correctCount, totalKeystrokesRef.current);

    const summary: TypingResultData = {
      sessionType,
      lessonId,
      wpm: finalWpm,
      grossWpm: finalGrossWpm,
      accuracy: finalAccuracy,
      durationSeconds: duration,
      correctCharacters: correctCount,
      incorrectCharacters: incorrectCount,
      totalKeystrokes: totalKeystrokesRef.current,
      backspaceCount: backspaceCountRef.current,
      mistypedKeys: { ...mistypedKeysRef.current },
      correctKeys: { ...correctKeysRef.current },
      completedAt: new Date().toISOString(),
    };

    setResultsData(summary);
    if (onComplete) {
      onComplete(summary);
    }
  }, [
    isCompleted,
    elapsedSeconds,
    correctCount,
    incorrectCount,
    sessionType,
    lessonId,
    onComplete,
  ]);

  // Handle keystroke logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Avoid interfering with browser refresh (F5), devtools, etc.
    if (e.key === "Tab" || e.key === "Escape") {
      e.preventDefault();
      resetSession();
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    if (isCompleted) return;

    // Start timer on first valid keystroke
    if (!startTime && e.key.length === 1) {
      setStartTime(Date.now());
    }

    setLastPressedKey(e.key);

    if (e.key === "Backspace") {
      e.preventDefault();
      backspaceCountRef.current += 1;
      if (typedChars.length > 0) {
        soundManager.playKeyStroke(false);
        setTypedChars((prev) => prev.slice(0, -1));
        setIsLastError(false);
      }
      return;
    }

    // Only handle single characters (letters, numbers, symbols, space)
    if (e.key.length === 1) {
      e.preventDefault();
      totalKeystrokesRef.current += 1;

      const expected = text[currentIndex];
      const isCorrect = e.key === expected;

      if (isCorrect) {
        soundManager.playKeyStroke(e.key === " ");
        setIsLastError(false);
        correctKeysRef.current[expected] = (correctKeysRef.current[expected] || 0) + 1;
      } else {
        soundManager.playError();
        setIsLastError(true);
        if (expected) {
          mistypedKeysRef.current[expected] = (mistypedKeysRef.current[expected] || 0) + 1;
        }
      }

      const nextTyped = [...typedChars, e.key];
      setTypedChars(nextTyped);

      // Check if finished entire text
      if (nextTyped.length >= text.length) {
        setTimeout(() => handleSessionEnd(), 50);
      }
    }
  };

  const resetSession = () => {
    setTypedChars([]);
    setStartTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setIsLastError(false);
    setLastPressedKey(undefined);
    setResultsData(null);
    totalKeystrokesRef.current = 0;
    backspaceCountRef.current = 0;
    mistypedKeysRef.current = {};
    correctKeysRef.current = {};
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(focusInput, 50);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  return (
    <div
      className="w-full flex flex-col items-center gap-6 cursor-text"
      onClick={focusInput}
    >
      {/* Hidden input to capture physical keyboard input and mobile soft keyboards */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -top-96 left-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Top Status & Controls Header */}
      <div className="w-full max-w-4xl flex items-center justify-between px-4 py-3 rounded-xl bg-[#171A23] border border-[#262B38] text-sm shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#858B99] uppercase tracking-wider font-semibold">WPM</span>
            <span className="text-xl font-bold font-mono text-[#D4F36B]">{currentWpm}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#858B99] uppercase tracking-wider font-semibold">Accuracy</span>
            <span className="text-xl font-bold font-mono text-[#F1F3F5]">{currentAccuracy}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#858B99] uppercase tracking-wider font-semibold">Time</span>
            <span className="text-xl font-bold font-mono text-[#8B7CFF]">
              {durationLimit ? `${Math.max(0, durationLimit - elapsedSeconds)}s` : `${elapsedSeconds}s`}
            </span>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSound();
            }}
            title={soundEnabled ? "Mute sounds" : "Enable mechanical sounds"}
            className="p-2 rounded-lg bg-[#0D0F14] hover:bg-[#262B38] text-[#858B99] hover:text-[#F1F3F5] transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#D4F36B]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {showKeyboardToggle && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowKeyboard(!showKeyboard);
                }}
                title={showKeyboard ? "Hide virtual keyboard" : "Show virtual keyboard"}
                className="p-2 rounded-lg bg-[#0D0F14] hover:bg-[#262B38] text-[#858B99] hover:text-[#F1F3F5] transition-colors"
              >
                {showKeyboard ? <Eye className="w-4 h-4 text-[#8B7CFF]" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFingerGuide(!showFingerGuide);
                }}
                title={showFingerGuide ? "Hide finger guidance" : "Show finger guidance"}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-lg font-medium transition-colors border",
                  showFingerGuide
                    ? "bg-[#8B7CFF]/20 border-[#8B7CFF]/40 text-[#8B7CFF]"
                    : "bg-[#0D0F14] border-[#262B38] text-[#858B99]"
                )}
              >
                Fingers
              </button>
            </>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              resetSession();
            }}
            title="Restart exercise (Tab or Esc)"
            className="p-2 rounded-lg bg-[#0D0F14] hover:bg-[#262B38] text-[#858B99] hover:text-[#F1F3F5] transition-colors ml-2"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Typing Display Area */}
      <div
        className="w-full max-w-4xl p-6 sm:p-8 rounded-2xl bg-[#171A23] border border-[#262B38] min-h-[160px] flex flex-wrap items-center content-start gap-y-2 text-xl sm:text-2xl font-mono leading-relaxed tracking-wider shadow-xl relative select-none"
        onClick={focusInput}
      >
        {text.split("").map((char, index) => {
          const isTyped = index < typedChars.length;
          const isCurrent = index === currentIndex;
          const isCorrect = isTyped && typedChars[index] === char;
          const isWrong = isTyped && typedChars[index] !== char;

          return (
            <span
              key={index}
              className={cn(
                "relative transition-colors duration-75 inline-block",
                // Unreached characters
                !isTyped && !isCurrent && "text-[#858B99]/60",
                // Correctly typed
                isCorrect && "text-[#F1F3F5] font-medium",
                // Incorrectly typed
                isWrong && "text-red-400 bg-red-500/20 underline decoration-red-500 decoration-2 rounded-sm",
                // Space representation
                char === " " && isWrong && "bg-red-500/40 text-red-300",
                char === " " ? "w-3" : ""
              )}
            >
              {/* Caret */}
              {isCurrent && (
                <span className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] bg-[#D4F36B] rounded-full animate-caret-blink shadow-[0_0_8px_#D4F36B]" />
              )}
              {char}
            </span>
          );
        })}

        {/* Start Hint */}
        {!startTime && typedChars.length === 0 && (
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center pointer-events-none text-xs text-[#858B99] animate-pulse">
            <span>Type to begin • Press Tab or Esc to restart</span>
          </div>
        )}
      </div>

      {/* Interactive Virtual Keyboard */}
      {showKeyboard && (
        <VirtualKeyboard
          currentExpectedChar={currentExpectedChar}
          lastPressedKey={lastPressedKey}
          isLastKeyError={isLastError}
          needsBackspace={isCurrentPositionError}
          showFingerGuide={showFingerGuide}
        />
      )}

      {/* Results Modal */}
      {isCompleted && resultsData && (
        <ResultsModal
          data={resultsData}
          onRetry={resetSession}
          onClose={() => setIsCompleted(false)}
        />
      )}
    </div>
  );
}

