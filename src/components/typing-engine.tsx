"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { calculateWpm, calculateAccuracy, calculateGrossWpm } from "@/lib/typing-utils";
import { soundManager } from "@/lib/sound";
import { VirtualKeyboard } from "./virtual-keyboard";
import { ResultsModal, TypingResultData } from "./results-modal";
import { RotateCcw, Volume2, VolumeX, Eye, EyeOff } from "lucide-react";

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
  const [text, setText] = useState<string>(initialText.trim());
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastPressedKey, setLastPressedKey] = useState<string | undefined>(undefined);
  const [lastPressedCode, setLastPressedCode] = useState<string | undefined>(undefined);
  const [isLastError, setIsLastError] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [showFingerGuide, setShowFingerGuide] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [resultsData, setResultsData] = useState<TypingResultData | null>(null);

  // Synchronous refs to prevent dropped keystrokes during high-velocity rapid typing (100+ WPM)
  const typedCharsRef = useRef<string[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const totalKeystrokesRef = useRef<number>(0);
  const totalErrorsRef = useRef<number>(0);
  const backspaceCountRef = useRef<number>(0);
  const mistypedKeysRef = useRef<Record<string, number>>({});
  const correctKeysRef = useRef<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletedRef = useRef<boolean>(false);

  // Synchronize initial text
  useEffect(() => {
    setText(initialText.trim());
    resetSession();
  }, [initialText]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  useEffect(() => {
    focusInput();
  }, []);

  // Timer loop with millisecond precision
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diffExact = (now - startTime) / 1000;
        const diffInt = Math.floor(diffExact);
        setElapsedSeconds(diffInt);

        if (durationLimit && diffExact >= durationLimit) {
          handleSessionEnd();
        }
      }, 200);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted, durationLimit]);

  // Current real-time metrics
  const currentIndex = typedChars.length;
  const currentExpectedChar = currentIndex < text.length ? text[currentIndex] : undefined;

  let currentCorrectCount = 0;
  for (let i = 0; i < typedChars.length; i++) {
    if (typedChars[i] === text[i]) {
      currentCorrectCount++;
    }
  }

  const effectiveSeconds = Math.max(1, elapsedSeconds);
  const currentWpm = calculateWpm(currentCorrectCount, effectiveSeconds);
  const currentGrossWpm = calculateGrossWpm(totalKeystrokesRef.current, effectiveSeconds);
  const currentAccuracy =
    totalKeystrokesRef.current > 0
      ? calculateAccuracy(
          Math.max(0, totalKeystrokesRef.current - totalErrorsRef.current),
          totalKeystrokesRef.current
        )
      : 100;

  const isCurrentPositionError =
    currentIndex > 0 && typedChars[currentIndex - 1] !== text[currentIndex - 1];

  // Finish session
  const handleSessionEnd = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    soundManager.playSuccess();

    const now = Date.now();
    const exactDurationSeconds = startTimeRef.current
      ? Math.max(0.5, (now - startTimeRef.current) / 1000)
      : Math.max(1, elapsedSeconds);

    const finalTyped = typedCharsRef.current;
    let finalCorrectChars = 0;
    let uncorrectedErrors = 0;

    for (let i = 0; i < finalTyped.length; i++) {
      if (finalTyped[i] === text[i]) {
        finalCorrectChars++;
      } else {
        uncorrectedErrors++;
      }
    }

    const totalErrors = totalErrorsRef.current;
    const correctedErrors = Math.max(0, totalErrors - uncorrectedErrors);
    const finalWpm = calculateWpm(finalCorrectChars, exactDurationSeconds);
    const finalGrossWpm = calculateGrossWpm(totalKeystrokesRef.current, exactDurationSeconds);
    const finalAccuracy =
      totalKeystrokesRef.current > 0
        ? calculateAccuracy(
            Math.max(0, totalKeystrokesRef.current - totalErrors),
            totalKeystrokesRef.current
          )
        : 100;

    const summary: TypingResultData = {
      sessionType,
      lessonId,
      wpm: finalWpm,
      grossWpm: finalGrossWpm,
      accuracy: finalAccuracy,
      durationSeconds: Math.round(exactDurationSeconds * 10) / 10,
      correctCharacters: finalCorrectChars,
      incorrectCharacters: totalErrors,
      correctedErrors,
      uncorrectedErrors,
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
  }, [elapsedSeconds, text, sessionType, lessonId, onComplete]);

  // Handle keystroke logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Reset shortcut
    if (e.key === "Tab" || e.key === "Escape") {
      e.preventDefault();
      resetSession();
      return;
    }

    // Ignore browser system commands
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    if (isCompletedRef.current) return;

    setLastPressedKey(e.key);
    setLastPressedCode(e.code);

    // Backspace handling
    if (e.key === "Backspace") {
      e.preventDefault();
      backspaceCountRef.current += 1;
      if (typedCharsRef.current.length > 0) {
        soundManager.playKeyStroke(false);
        typedCharsRef.current = typedCharsRef.current.slice(0, -1);
        setTypedChars([...typedCharsRef.current]);
        setIsLastError(false);
      }
      return;
    }

    // Printable single-character keystrokes (letters, numbers, punctuation, space)
    if (e.key.length === 1) {
      e.preventDefault();

      // Start timer on first character
      if (!startTimeRef.current) {
        const now = Date.now();
        startTimeRef.current = now;
        setStartTime(now);
      }

      totalKeystrokesRef.current += 1;
      const currentPos = typedCharsRef.current.length;
      const expected = text[currentPos];
      const isCorrect = e.key === expected;

      if (isCorrect) {
        soundManager.playKeyStroke(e.key === " ");
        setIsLastError(false);
        correctKeysRef.current[expected] = (correctKeysRef.current[expected] || 0) + 1;
      } else {
        soundManager.playError();
        setIsLastError(true);
        totalErrorsRef.current += 1;
        if (expected) {
          mistypedKeysRef.current[expected] = (mistypedKeysRef.current[expected] || 0) + 1;
        }
      }

      // Synchronous mutation prevents dropping keystrokes during rapid typing
      const nextTyped = [...typedCharsRef.current, e.key];
      typedCharsRef.current = nextTyped;
      setTypedChars(nextTyped);

      // Finish when reaching text length
      if (nextTyped.length >= text.length) {
        setTimeout(() => handleSessionEnd(), 40);
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Release key visual highlights smoothly
    if (lastPressedCode === e.code) {
      setLastPressedKey(undefined);
      setLastPressedCode(undefined);
    }
  };

  const resetSession = () => {
    typedCharsRef.current = [];
    startTimeRef.current = null;
    totalKeystrokesRef.current = 0;
    totalErrorsRef.current = 0;
    backspaceCountRef.current = 0;
    mistypedKeysRef.current = {};
    correctKeysRef.current = {};
    isCompletedRef.current = false;

    setTypedChars([]);
    setStartTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setIsLastError(false);
    setLastPressedKey(undefined);
    setLastPressedCode(undefined);
    setResultsData(null);

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
      className="w-full flex flex-col items-center gap-6 cursor-text relative"
      onClick={focusInput}
    >
      {/* Hidden input element optimized for desktop physical input & mobile keyboards */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        tabIndex={0}
        className="opacity-0 absolute top-0 left-0 w-1 h-1 p-0 m-0 border-0 outline-none select-none pointer-events-none"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Top Status & Controls Header */}
      <div className="w-full max-w-4xl flex items-center justify-between px-5 py-3 rounded-2xl bg-[#13161F] border border-[#1E2333] text-sm shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#858B99] uppercase tracking-wider font-semibold">WPM</span>
            <span className="text-xl font-bold font-mono text-[#D4F36B]">{currentWpm}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#858B99] uppercase tracking-wider font-semibold">Accuracy</span>
            <span className="text-xl font-bold font-mono text-[#F1F3F5]">{currentAccuracy}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#858B99] uppercase tracking-wider font-semibold">Time</span>
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
            className="p-2 rounded-xl bg-[#090A0F] hover:bg-[#1E2333] text-[#858B99] hover:text-[#F1F3F5] transition-colors"
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
                className="p-2 rounded-xl bg-[#090A0F] hover:bg-[#1E2333] text-[#858B99] hover:text-[#F1F3F5] transition-colors"
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
                  "px-2.5 py-1 text-xs rounded-xl font-medium transition-colors border",
                  showFingerGuide
                    ? "bg-[#8B7CFF]/15 border-[#8B7CFF]/30 text-[#8B7CFF]"
                    : "bg-[#090A0F] border-[#1E2333] text-[#858B99]"
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
            className="p-2 rounded-xl bg-[#090A0F] hover:bg-[#1E2333] text-[#858B99] hover:text-[#F1F3F5] transition-colors ml-1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Typing Display Area */}
      <div
        className={cn(
          "w-full max-w-4xl p-6 sm:p-8 rounded-3xl bg-[#13161F] border min-h-[170px] flex flex-wrap items-center content-start gap-y-2 text-xl sm:text-2xl font-mono leading-relaxed tracking-wider shadow-xl relative select-none transition-all whitespace-pre-wrap",
          isFocused ? "border-[#1E2333]" : "border-amber-500/40"
        )}
        onClick={focusInput}
      >
        {!isFocused && !isCompleted && (
          <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[1px] rounded-3xl flex items-center justify-center pointer-events-none">
            <span className="px-4 py-2 rounded-full bg-[#13161F] border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-lg">
              Click anywhere to resume typing
            </span>
          </div>
        )}

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
                !isTyped && !isCurrent && "text-[#858B99]/50",
                // Correctly typed
                isCorrect && "text-[#F1F3F5] font-medium",
                // Incorrectly typed
                isWrong && "text-red-400 bg-red-500/20 underline decoration-red-500 decoration-2 rounded-sm",
                // Space representation
                char === " " && isWrong && "bg-red-500/40 text-red-300",
                char === " " ? "w-3" : ""
              )}
            >
              {/* Animated Caret */}
              {isCurrent && isFocused && (
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
          lastPressedCode={lastPressedCode}
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
