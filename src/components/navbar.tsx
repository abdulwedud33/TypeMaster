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
  Menu,
  X,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";
import { StreakBadge } from "./streak-badge";
import { cn } from "@/lib/utils";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  isDemo?: boolean;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setStreak(data.progress?.currentStreak || 0);
        }
      } catch {
        // Silently continue if not logged in
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

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Learn", href: "/learn", icon: GraduationCap },
    { name: "Practice", href: "/practice", icon: PlaySquare },
    { name: "Typing Tests", href: "/test", icon: Timer },
    { name: "Progress", href: "/progress", icon: LineChart },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0D0F14]/90 backdrop-blur-md border-b border-[#262B38]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#D4F36B] flex items-center justify-center text-[#0D0F14] font-black group-hover:scale-105 transition-transform shadow-md shadow-[#D4F36B]/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#F1F3F5] flex items-center gap-1">
              Type<span className="text-[#D4F36B]">Master</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-[#171A23] text-[#D4F36B] border border-[#262B38] shadow-inner"
                      : "text-[#858B99] hover:text-[#F1F3F5] hover:bg-[#171A23]/60"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-[#D4F36B]" : "text-[#858B99]")} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons & Profile */}
          <div className="hidden md:flex items-center gap-3">
            <StreakBadge streak={streak} />

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#262B38]">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-[#F1F3F5] truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#858B99] truncate max-w-[120px]">
                    {user.isDemo ? "Demo User" : user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-[#171A23] hover:bg-[#262B38] text-[#858B99] hover:text-rose-400 border border-[#262B38] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#858B99] hover:text-[#F1F3F5] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#D4F36B] text-[#0D0F14] hover:bg-[#bde050] transition-colors shadow-sm shadow-[#D4F36B]/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <StreakBadge streak={streak} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-[#171A23] text-[#858B99] hover:text-[#F1F3F5] border border-[#262B38]"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-[#262B38] bg-[#0D0F14] px-4 pt-3 pb-6 flex flex-col gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  isActive
                    ? "bg-[#171A23] text-[#D4F36B] border border-[#262B38]"
                    : "text-[#858B99] hover:bg-[#171A23]"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-[#262B38] flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#171A23] border border-[#262B38]">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#F1F3F5]">{user.name}</span>
                  <span className="text-xs text-[#858B99]">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-rose-400 hover:bg-[#262B38] rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-[#171A23] border border-[#262B38] text-[#F1F3F5]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-xl text-center text-sm font-bold bg-[#D4F36B] text-[#0D0F14]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

