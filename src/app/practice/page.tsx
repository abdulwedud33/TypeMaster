"use client";

import React, { useState, useEffect } from "react";
import { TypingEngine } from "@/components/typing-engine";
import {
  PlaySquare,
  Settings2,
  Clock,
  Sparkles,
  FileText,
  Target,
  Shuffle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PracticeCategory =
  | "words"
  | "sentences"
  | "paragraphs"
  | "lowercase"
  | "uppercase"
  | "numbers"
  | "punctuation"
  | "symbols"
  | "mixed"
  | "weak_keys"
  | "custom";

const WORD_BANK = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
];

const SENTENCE_BANK = [
  "Consistency is the true foundation of touch typing mastery.",
  "Never sacrifice accuracy in the false pursuit of sheer speed.",
  "Keep your wrists floating gently above the desk and relax your shoulders.",
  "Touch typing frees your cognitive capacity to focus solely on creative thinking.",
  "With deliberate daily practice, complicated keystrokes turn into intuitive rhythm.",
  "The quick brown fox jumps over the lazy dog without breaking stride.",
];

const PARAGRAPH_BANK = [
  "Software development is as much about clear communication as it is about syntax. When you can express your thoughts through the keyboard without hesitation, coding feels like writing poetry. Your fingers intuitively reach for brackets, operators, and semicolons while your mind solves the real problem.",
  "The standard QWERTY layout was engineered in the era of mechanical typewriters, yet touch typing remains the most critical bridge between human creativity and the digital machine. Dedicating time to refine every finger placement produces enduring compounding returns across your entire technical career.",
];

export default function PracticePage() {
  const [category, setCategory] = useState<PracticeCategory>("words");
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [customText, setCustomText] = useState<string>("");
  const [activeText, setActiveText] = useState<string>("");
  const [weakKeys, setWeakKeys] = useState<string[]>([]);

  useEffect(() => {
    async function fetchWeakKeys() {
      try {
        const res = await fetch("/api/stats/weak-keys");
        if (res.ok) {
          const data = await res.json();
          if (data.weakKeys && data.weakKeys.length > 0) {
            setWeakKeys(data.weakKeys.map((k: any) => k.character));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchWeakKeys();
  }, []);

  const generateText = (cat: PracticeCategory) => {
    switch (cat) {
      case "words": {
        const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 30).join(" ");
      }
      case "sentences": {
        const shuffled = [...SENTENCE_BANK].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3).join(" ");
      }
      case "paragraphs": {
        return PARAGRAPH_BANK[Math.floor(Math.random() * PARAGRAPH_BANK.length)];
      }
      case "lowercase": {
        const words = WORD_BANK.filter((w) => w.length >= 4);
        return [...words].sort(() => 0.5 - Math.random()).slice(0, 25).join(" ");
      }
      case "uppercase": {
        return "HELLO WORLD. TOUCH TYPING ACCELERATION. PRACTICE SHIFT KEYS DAILY WITH DISCIPLINE.";
      }
      case "numbers": {
        const nums = [];
        for (let i = 0; i < 20; i++) {
          nums.push(Math.floor(100 + Math.random() * 9000).toString());
        }
        return nums.join(" ");
      }
      case "punctuation": {
        return "wait, look! what is that? it's right here; yes, indeed: honesty, focus, and diligence.";
      }
      case "symbols": {
        return "(x + y) * [z - 1] = @result; $total = 100% & { status: 200 } <output>";
      }
      case "mixed": {
        return "In 2026, TypeMaster teaches 100% touch typing: accuracy @ 98% with 65+ WPM (verified).";
      }
      case "weak_keys": {
        if (weakKeys.length === 0) {
          return "great typists practice difficult keys like p q z x and semicolons steadily";
        }
        // Build targeted exercise using user's actual weak keys
        const chars = weakKeys.slice(0, 5);
        const drills = chars.map((c) => `${c}${c}${c} ${c}a${c} ${c}e${c} ${c}o${c}`).join(" ");
        return `${drills} focus on your problem keys with calm precision`;
      }
      case "custom": {
        return customText.trim() || "Paste or write your custom text in the configuration box above.";
      }
      default:
        return "the quick brown fox jumps over the lazy dog";
    }
  };

  useEffect(() => {
    setActiveText(generateText(category));
  }, [category]);

  const handleApplyCustom = () => {
    if (customText.trim()) {
      setActiveText(customText.trim());
    }
  };

  const categories: Array<{ id: PracticeCategory; label: string }> = [
    { id: "words", label: "Common Words" },
    { id: "sentences", label: "Sentences" },
    { id: "paragraphs", label: "Paragraphs" },
    { id: "lowercase", label: "Lowercase" },
    { id: "uppercase", label: "Uppercase" },
    { id: "numbers", label: "Numbers" },
    { id: "punctuation", label: "Punctuation" },
    { id: "symbols", label: "Symbols" },
    { id: "mixed", label: "Mixed Content" },
    { id: "weak_keys", label: "Weak Keys Drill" },
    { id: "custom", label: "Custom Text" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262B38] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A23] border border-[#262B38] text-xs font-semibold text-[#8B7CFF] mb-2">
            <PlaySquare className="w-3.5 h-3.5" />
            <span>Customizable Practice Mode</span>
          </div>
          <h1 className="text-3xl font-black text-[#F1F3F5]">Flexible Practice Drills</h1>
          <p className="text-xs sm:text-sm text-[#858B99] mt-1">
            Configure target character sets, timing, and custom text to hone specific skills.
          </p>
        </div>

        <button
          onClick={() => setActiveText(generateText(category))}
          className="px-4 py-2.5 rounded-xl bg-[#171A23] hover:bg-[#262B38] border border-[#262B38] text-xs font-semibold text-[#D4F36B] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Shuffle className="w-4 h-4" /> Shuffle Text
        </button>
      </div>

      {/* Configuration Controls Bar */}
      <div className="p-5 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-4">
        {/* Category Pills */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#858B99]">
            Practice Content:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                  category === cat.id
                    ? "bg-[#D4F36B] text-[#0D0F14] border-[#D4F36B] shadow-sm shadow-[#D4F36B]/20"
                    : "bg-[#0D0F14] text-[#858B99] hover:text-[#F1F3F5] border-[#262B38]"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit Selector */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#262B38]/60 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#858B99] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Duration Limit:
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { label: "Unlimited", val: undefined },
              { label: "15s", val: 15 },
              { label: "30s", val: 30 },
              { label: "60s", val: 60 },
              { label: "120s", val: 120 },
            ].map((d) => (
              <button
                key={d.label}
                onClick={() => setDuration(d.val)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all border",
                  duration === d.val
                    ? "bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF]/40"
                    : "bg-[#0D0F14] text-[#858B99] border-[#262B38]"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Textarea if custom mode */}
        {category === "custom" && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#262B38]/60">
            <label className="text-xs font-semibold text-[#858B99]">
              Paste Your Custom Text Here:
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste any article, documentation paragraph, or code snippet..."
              className="w-full p-3 rounded-xl bg-[#0D0F14] border border-[#262B38] text-xs text-[#F1F3F5] focus:outline-none focus:border-[#D4F36B] font-mono"
            />
            <button
              onClick={handleApplyCustom}
              className="self-end px-4 py-2 rounded-xl bg-[#D4F36B] text-[#0D0F14] text-xs font-bold hover:bg-[#bde050] transition-colors"
            >
              Apply Custom Text
            </button>
          </div>
        )}
      </div>

      {/* Active Typing Engine */}
      <TypingEngine
        key={`${category}_${duration}_${activeText.slice(0, 10)}`}
        initialText={activeText}
        sessionType={category === "weak_keys" ? "weak_keys" : "practice"}
        durationLimit={duration}
        showKeyboardToggle={true}
      />
    </div>
  );
}

