"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Keyboard,
  LayoutDashboard,
  GraduationCap,
  PlaySquare,
  Timer,
  LineChart,
  Settings,
  LogOut,
  Flame,
  ChevronRight,
  Sparkles,
  User,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  isDemo?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setStreak(data.progress?.currentStreak || 0);
          setLevel(data.progress?.currentLevel || 1);
        }
      } catch {
        // Ignore unauthenticated
      }
    }
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const navGroups = [
    {
      title: "LEARN & PRACTICE",
      links: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Curriculum", href: "/learn", icon: GraduationCap, badge: "10 Levels" },
        { name: "Practice Drills", href: "/practice", icon: PlaySquare },
        { name: "Typing Tests", href: "/test", icon: Timer },
      ],
    },
    {
      title: "ANALYTICS",
      links: [
        { name: "Progress & Heatmap", href: "/progress", icon: LineChart },
      ],
    },
    {
      title: "PREFERENCES",
      links: [
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[#0D0F14]/95 backdrop-blur-md border-b border-[#1E2333] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D4F36B] flex items-center justify-center text-[#0D0F14] font-black shadow-md shadow-[#D4F36B]/20">
            <Keyboard className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#F1F3F5]">
            Type<span className="text-[#D4F36B]">Master</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streak}d</span>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[#13161F] border border-[#1E2333] text-[#858B99] hover:text-[#F1F3F5]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0D0F14] border-r border-[#1E2333] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top: Logo & Brand */}
        <div className="flex flex-col">
          <div className="p-5 border-b border-[#1E2333]/80 flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4F36B] flex items-center justify-center text-[#0D0F14] font-black group-hover:scale-105 transition-all shadow-lg shadow-[#D4F36B]/20">
                <Keyboard className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#F1F3F5] flex items-center gap-1">
                  Type<span className="text-[#D4F36B]">Master</span>
                </span>
                <span className="text-[10px] text-[#858B99] tracking-wider uppercase font-semibold">
                  Touch Typing Academy
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#858B99] hover:text-[#F1F3F5]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Streak & Level Widget */}
          <div className="px-4 py-3.5 border-b border-[#1E2333]/60 bg-[#13161F]/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#858B99] uppercase font-bold tracking-wider">
                  Streak
                </span>
                <span className="text-xs font-bold text-[#F1F3F5] font-mono">
                  {streak} {streak === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-[#1E2333]">
              <div className="w-8 h-8 rounded-lg bg-[#8B7CFF]/10 border border-[#8B7CFF]/25 flex items-center justify-center text-[#8B7CFF]">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#858B99] uppercase font-bold tracking-wider">
                  Rank
                </span>
                <span className="text-xs font-bold text-[#D4F36B] font-mono">
                  Lvl {level}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links Groups */}
          <nav className="p-3 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-240px)]">
            {navGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-1">
                <span className="px-3 text-[10px] font-bold tracking-widest text-[#858B99]/70 uppercase mb-1">
                  {group.title}
                </span>

                {group.links.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/dashboard" && pathname.startsWith(link.href));

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative",
                        isActive
                          ? "bg-[#13161F] text-[#D4F36B] border border-[#1E2333] shadow-sm"
                          : "text-[#858B99] hover:text-[#F1F3F5] hover:bg-[#13161F]/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-[#D4F36B]" : "text-[#858B99] group-hover:text-[#F1F3F5]"
                          )}
                        />
                        <span>{link.name}</span>
                      </div>

                      {link.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30">
                          {link.badge}
                        </span>
                      )}

                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4F36B] shadow-[0_0_8px_#D4F36B]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-[#1E2333] bg-[#0A0C10]">
          {user ? (
            <div className="p-2.5 rounded-xl bg-[#13161F] border border-[#1E2333] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#D4F36B]/15 border border-[#D4F36B]/30 flex items-center justify-center text-[#D4F36B] font-bold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#F1F3F5] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#858B99] truncate">
                    {user.isDemo ? "Demo Account" : user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-[#858B99] hover:text-rose-400 hover:bg-[#1E2333] transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2 rounded-xl text-center text-xs font-semibold bg-[#13161F] hover:bg-[#1E2333] text-[#F1F3F5] border border-[#1E2333] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2 rounded-xl text-center text-xs font-bold bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] transition-colors shadow-sm shadow-[#D4F36B]/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

