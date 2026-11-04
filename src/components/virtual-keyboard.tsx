"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  KEY_TO_FINGER,
  FINGER_MAP,
  getFingerForKey,
  requiresShift,
  getRequiredShiftHand,
  FingerName,
} from "@/lib/typing-utils";

interface VirtualKeyboardProps {
  currentExpectedChar?: string;
  lastPressedKey?: string;
  isLastKeyError?: boolean;
  needsBackspace?: boolean;
  showFingerGuide?: boolean;
}

interface KeyConfig {
  key: string;
  shiftKey?: string;
  label?: string;
  width?: string;
  code?: string;
}

const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 1: Numbers & Symbols
  [
    { key: "`", shiftKey: "~", width: "w-10 sm:w-12" },
    { key: "1", shiftKey: "!", width: "w-10 sm:w-12" },
    { key: "2", shiftKey: "@", width: "w-10 sm:w-12" },
    { key: "3", shiftKey: "#", width: "w-10 sm:w-12" },
    { key: "4", shiftKey: "$", width: "w-10 sm:w-12" },
    { key: "5", shiftKey: "%", width: "w-10 sm:w-12" },
    { key: "6", shiftKey: "^", width: "w-10 sm:w-12" },
    { key: "7", shiftKey: "&", width: "w-10 sm:w-12" },
    { key: "8", shiftKey: "*", width: "w-10 sm:w-12" },
    { key: "9", shiftKey: "(", width: "w-10 sm:w-12" },
    { key: "0", shiftKey: ")", width: "w-10 sm:w-12" },
    { key: "-", shiftKey: "_", width: "w-10 sm:w-12" },
    { key: "=", shiftKey: "+", width: "w-10 sm:w-12" },
    { key: "Backspace", label: "Backspace", width: "w-16 sm:w-20", code: "Backspace" },
  ],
  // Row 2: Top Row
  [
    { key: "Tab", label: "Tab", width: "w-14 sm:w-16", code: "Tab" },
    { key: "q", shiftKey: "Q", width: "w-10 sm:w-12" },
    { key: "w", shiftKey: "W", width: "w-10 sm:w-12" },
    { key: "e", shiftKey: "E", width: "w-10 sm:w-12" },
    { key: "r", shiftKey: "R", width: "w-10 sm:w-12" },
    { key: "t", shiftKey: "T", width: "w-10 sm:w-12" },
    { key: "y", shiftKey: "Y", width: "w-10 sm:w-12" },
    { key: "u", shiftKey: "U", width: "w-10 sm:w-12" },
    { key: "i", shiftKey: "I", width: "w-10 sm:w-12" },
    { key: "o", shiftKey: "O", width: "w-10 sm:w-12" },
    { key: "p", shiftKey: "P", width: "w-10 sm:w-12" },
    { key: "[", shiftKey: "{", width: "w-10 sm:w-12" },
    { key: "]", shiftKey: "}", width: "w-10 sm:w-12" },
    { key: "\\", shiftKey: "|", width: "w-12 sm:w-16" },
  ],
  // Row 3: Home Row
  [
    { key: "CapsLock", label: "Caps", width: "w-16 sm:w-20", code: "CapsLock" },
    { key: "a", shiftKey: "A", width: "w-10 sm:w-12" },
    { key: "s", shiftKey: "S", width: "w-10 sm:w-12" },
    { key: "d", shiftKey: "D", width: "w-10 sm:w-12" },
    { key: "f", shiftKey: "F", width: "w-10 sm:w-12" }, // Anchor bump
    { key: "g", shiftKey: "G", width: "w-10 sm:w-12" },
    { key: "h", shiftKey: "H", width: "w-10 sm:w-12" },
    { key: "j", shiftKey: "J", width: "w-10 sm:w-12" }, // Anchor bump
    { key: "k", shiftKey: "K", width: "w-10 sm:w-12" },
    { key: "l", shiftKey: "L", width: "w-10 sm:w-12" },
    { key: ";", shiftKey: ":", width: "w-10 sm:w-12" },
    { key: "'", shiftKey: '"', width: "w-10 sm:w-12" },
    { key: "Enter", label: "Enter", width: "w-16 sm:w-20", code: "Enter" },
  ],
  // Row 4: Bottom Row
  [
    { key: "ShiftLeft", label: "Shift", width: "w-20 sm:w-24", code: "ShiftLeft" },
    { key: "z", shiftKey: "Z", width: "w-10 sm:w-12" },
    { key: "x", shiftKey: "X", width: "w-10 sm:w-12" },
    { key: "c", shiftKey: "C", width: "w-10 sm:w-12" },
    { key: "v", shiftKey: "V", width: "w-10 sm:w-12" },
    { key: "b", shiftKey: "B", width: "w-10 sm:w-12" },
    { key: "n", shiftKey: "N", width: "w-10 sm:w-12" },
    { key: "m", shiftKey: "M", width: "w-10 sm:w-12" },
    { key: ",", shiftKey: "<", width: "w-10 sm:w-12" },
    { key: ".", shiftKey: ">", width: "w-10 sm:w-12" },
    { key: "/", shiftKey: "?", width: "w-10 sm:w-12" },
    { key: "ShiftRight", label: "Shift", width: "w-20 sm:w-24", code: "ShiftRight" },
  ],
  // Row 5: Space Bar
  [
    { key: "CtrlLeft", label: "Ctrl", width: "w-12 sm:w-14", code: "Control" },
    { key: "AltLeft", label: "Alt", width: "w-12 sm:w-14", code: "Alt" },
    { key: " ", label: "Space", width: "w-64 sm:w-80", code: "Space" },
    { key: "AltRight", label: "Alt", width: "w-12 sm:w-14", code: "Alt" },
    { key: "CtrlRight", label: "Ctrl", width: "w-12 sm:w-14", code: "Control" },
  ],
];

export function VirtualKeyboard({
  currentExpectedChar,
  lastPressedKey,
  isLastKeyError,
  needsBackspace,
  showFingerGuide = true,
}: VirtualKeyboardProps) {
  const needsShift = currentExpectedChar ? requiresShift(currentExpectedChar) : false;
  const shiftHand = currentExpectedChar ? getRequiredShiftHand(currentExpectedChar) : null;
  const targetFinger = currentExpectedChar ? getFingerForKey(currentExpectedChar) : null;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-[#171A23] border border-[#262B38] shadow-2xl backdrop-blur-md select-none transition-all">
      {/* Keyboard guidance bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#262B38]/60 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <span className="text-[#858B99]">Target Key:</span>
          {currentExpectedChar ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#D4F36B] text-[#0D0F14] font-bold font-mono text-base shadow-sm">
                {currentExpectedChar === " " ? "␣ Space" : currentExpectedChar}
              </span>
              {needsShift && (
                <span className="px-2 py-0.5 rounded bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30 font-medium">
                  {shiftHand === "left" ? "Hold Left Shift" : "Hold Right Shift"}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[#858B99] italic">Ready</span>
          )}
        </div>

        {showFingerGuide && targetFinger && (
          <div className="flex items-center gap-2">
            <span className="text-[#858B99]">Use Finger:</span>
            <div className="flex items-center gap-1.5 font-medium text-[#F1F3F5]">
              <span
                className="w-3 h-3 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: targetFinger.color }}
              />
              <span>{targetFinger.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Grid */}
      <div className="flex flex-col gap-1.5 sm:gap-2 items-center overflow-x-auto py-1">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 sm:gap-1.5 justify-center">
            {row.map((k) => {
              const isTargetKey =
                currentExpectedChar !== undefined &&
                (k.key.toLowerCase() === currentExpectedChar.toLowerCase() ||
                  k.shiftKey === currentExpectedChar ||
                  (k.key === " " && currentExpectedChar === " "));

              const isLeftShiftTarget =
                needsShift && shiftHand === "left" && k.key === "ShiftLeft";
              const isRightShiftTarget =
                needsShift && shiftHand === "right" && k.key === "ShiftRight";
              const isShiftHighlight = isLeftShiftTarget || isRightShiftTarget;

              const isBackspaceHighlight =
                needsBackspace && (k.key === "Backspace" || k.code === "Backspace");

              const isCurrentlyPressed =
                lastPressedKey !== undefined &&
                (k.key.toLowerCase() === lastPressedKey.toLowerCase() ||
                  k.code?.toLowerCase() === lastPressedKey.toLowerCase() ||
                  (k.key === " " && lastPressedKey === " "));

              const fingerName = (KEY_TO_FINGER[k.key] || KEY_TO_FINGER[k.shiftKey || ""]) as FingerName | undefined;
              const fingerInfo = fingerName ? FINGER_MAP[fingerName] : undefined;

              const isAnchorKey = k.key === "f" || k.key === "j";

              return (
                <div
                  key={k.key}
                  className={cn(
                    "h-10 sm:h-12 rounded-lg flex flex-col items-center justify-center font-mono transition-all duration-100 text-xs sm:text-sm relative border cursor-default select-none",
                    k.width || "w-10 sm:w-12",
                    // Base styling
                    "bg-[#0D0F14] text-[#858B99] border-[#262B38] shadow-sm",
                    // Pressed styling
                    isCurrentlyPressed && !isLastKeyError && "scale-95 bg-[#D4F36B]/20 border-[#D4F36B] text-[#D4F36B]",
                    isCurrentlyPressed && isLastKeyError && "scale-95 bg-red-500/20 border-red-500 text-red-400",
                    // Target Key Styling
                    isTargetKey && !isCurrentlyPressed && "border-[#D4F36B] bg-[#D4F36B]/15 text-[#D4F36B] font-bold ring-2 ring-[#D4F36B]/40 animate-pulse",
                    // Shift highlight
                    isShiftHighlight && "border-[#8B7CFF] bg-[#8B7CFF]/20 text-[#8B7CFF] font-bold ring-2 ring-[#8B7CFF]/50 animate-pulse",
                    // Backspace highlight
                    isBackspaceHighlight && "border-amber-500 bg-amber-500/20 text-amber-400 font-bold ring-2 ring-amber-500/50 animate-bounce"
                  )}
                  style={
                    showFingerGuide && fingerInfo && !isTargetKey && !isShiftHighlight && !isBackspaceHighlight
                      ? { borderBottomColor: fingerInfo.color, borderBottomWidth: "2px" }
                      : {}
                  }
                >
                  {k.shiftKey && (
                    <span className="text-[10px] sm:text-xs leading-none text-[#858B99]">
                      {k.shiftKey}
                    </span>
                  )}
                  <span
                    className={cn(
                      "leading-none",
                      isTargetKey ? "text-[#F1F3F5] font-bold" : ""
                    )}
                  >
                    {k.label || k.key}
                  </span>

                  {/* Physical F & J bumps visual dot */}
                  {isAnchorKey && (
                    <span className="w-1.5 h-0.5 rounded-full bg-[#858B99] absolute bottom-1 opacity-70" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Finger Legend */}
      {showFingerGuide && (
        <div className="mt-4 pt-3 border-t border-[#262B38]/60 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] text-[#858B99]">
          <span className="font-medium text-[#F1F3F5]">Finger Guide:</span>
          {Object.values(FINGER_MAP).map((f) => (
            <div key={f.name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: f.color }}
              />
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

