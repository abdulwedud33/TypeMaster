"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Clock,
  RotateCcw,
  Download,
  AlertTriangle,
  Check,
  Sparkles,
} from "lucide-react";
import { soundManager } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface SettingsState {
  theme: string;
  showVirtualKeyboard: boolean;
  showFingerGuide: boolean;
  soundEnabled: boolean;
  dailyGoalMinutes: number;
  preferredTestDuration: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    theme: "dark",
    showVirtualKeyboard: true,
    showFingerGuide: true,
    soundEnabled: true,
    dailyGoalMinutes: 15,
    preferredTestDuration: 60,
  });
  const [saved, setSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          soundManager.setEnabled(data.soundEnabled);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, []);

  const saveSettings = async (next: SettingsState) => {
    setSettings(next);
    soundManager.setEnabled(next.soundEnabled);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetProgress = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/settings/reset", { method: "POST" });
      if (res.ok) {
        setResetConfirm(false);
        alert("Your typing progress and session records have been reset.");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = "/api/settings/export";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#262B38] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A23] border border-[#262B38] text-xs font-semibold text-[#D4F36B] mb-2">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Preferences & Data Management</span>
          </div>
          <h1 className="text-3xl font-black text-[#F1F3F5]">Platform Settings</h1>
          <p className="text-xs sm:text-sm text-[#858B99] mt-1">
            Personalize your typing environment, feedback audio, and goals.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Check className="w-4 h-4" /> Preferences Saved
          </div>
        )}
      </div>

      {/* Settings Sections */}
      <div className="flex flex-col gap-6">
        {/* Typing Interface Options */}
        <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B7CFF]">
            Typing Experience
          </h2>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-[#262B38]">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#D4F36B]" /> Mechanical Keyboard Audio
              </span>
              <span className="text-xs text-[#858B99]">
                Synthesizes low-latency click and error frequencies using Web Audio.
              </span>
            </div>
            <button
              onClick={() => saveSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative p-0.5",
                settings.soundEnabled ? "bg-[#D4F36B]" : "bg-[#262B38]"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full bg-[#0D0F14] transition-transform",
                  settings.soundEnabled ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Virtual Keyboard Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-[#262B38]">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#8B7CFF]" /> Interactive Virtual Keyboard
              </span>
              <span className="text-xs text-[#858B99]">
                Displays standard QWERTY on-screen key visualization during exercises.
              </span>
            </div>
            <button
              onClick={() =>
                saveSettings({ ...settings, showVirtualKeyboard: !settings.showVirtualKeyboard })
              }
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative p-0.5",
                settings.showVirtualKeyboard ? "bg-[#D4F36B]" : "bg-[#262B38]"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full bg-[#0D0F14] transition-transform",
                  settings.showVirtualKeyboard ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Finger Guidance Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#F1F3F5]">
                Finger Color Mapping & Hints
              </span>
              <span className="text-xs text-[#858B99]">
                Highlights which finger controls the active target key with color accents.
              </span>
            </div>
            <button
              onClick={() =>
                saveSettings({ ...settings, showFingerGuide: !settings.showFingerGuide })
              }
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative p-0.5",
                settings.showFingerGuide ? "bg-[#D4F36B]" : "bg-[#262B38]"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full bg-[#0D0F14] transition-transform",
                  settings.showFingerGuide ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Goals & Preferences */}
        <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B7CFF]">
            Goals & Benchmarks
          </h2>

          {/* Daily Goal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#262B38]">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#F1F3F5]">Daily Practice Target</span>
              <span className="text-xs text-[#858B99]">
                Set how many minutes of touch typing you commit to each day.
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[5, 10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => saveSettings({ ...settings, dailyGoalMinutes: mins })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    settings.dailyGoalMinutes === mins
                      ? "bg-[#D4F36B] text-[#0D0F14] border-[#D4F36B]"
                      : "bg-[#0D0F14] text-[#858B99] border-[#262B38]"
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Test Duration */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#F1F3F5]">
                Default Typing Test Duration
              </span>
              <span className="text-xs text-[#858B99]">
                Standard duration preselected when opening tests.
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[15, 30, 60, 120].map((s) => (
                <button
                  key={s}
                  onClick={() => saveSettings({ ...settings, preferredTestDuration: s })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    settings.preferredTestDuration === s
                      ? "bg-[#8B7CFF] text-[#0D0F14] border-[#8B7CFF]"
                      : "bg-[#0D0F14] text-[#858B99] border-[#262B38]"
                  )}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data & Privacy Management */}
        <div className="p-6 rounded-2xl bg-[#171A23] border border-[#262B38] flex flex-col gap-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400">
            Data Management
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262B38]">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#F1F3F5]">Export Session Records</span>
              <span className="text-xs text-[#858B99]">
                Download all your practice and test history in CSV format.
              </span>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-[#0D0F14] hover:bg-[#262B38] border border-[#262B38] text-xs font-semibold text-[#F1F3F5] transition-colors flex items-center gap-2 self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-[#D4F36B]" /> Export CSV
            </button>
          </div>

          {/* Reset Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-rose-300">Reset All Statistics</span>
              <span className="text-xs text-[#858B99]">
                Permanently clears completed lesson attempts, weak keys, and streaks.
              </span>
            </div>

            {resetConfirm ? (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleResetProgress}
                  disabled={isResetting}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isResetting ? "Resetting..." : "Confirm Reset"}
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#0D0F14] text-[#858B99] text-xs hover:text-[#F1F3F5]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <AlertTriangle className="w-4 h-4" /> Reset Progress
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

