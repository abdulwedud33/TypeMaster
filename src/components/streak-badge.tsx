"use client";

import React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all select-none",
        isActive
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/20"
          : "bg-[#171A23] border-[#262B38] text-[#858B99]",
        className
      )}
      title={isActive ? `${streak} day streak! Keep it up!` : "Start practicing today to build your streak!"}
    >
      <Flame className={cn("w-3.5 h-3.5", isActive ? "text-amber-400 fill-amber-400 animate-pulse" : "text-[#858B99]")} />
      <span>{streak} {streak === 1 ? "day" : "days"}</span>
    </div>
  );
}

