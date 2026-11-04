"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Keyboard, Lock, Mail, User, ArrowRight, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#171A23] border border-[#262B38] shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[#D4F36B] flex items-center justify-center text-[#0D0F14] font-black shadow-md shadow-[#D4F36B]/20">
            <Keyboard className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#F1F3F5]">Join TypeMaster</h1>
          <p className="text-xs text-[#858B99]">Build touch typing mastery with personalized drills</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#858B99]">Your Name</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-3.5 text-[#858B99]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abdulwedud"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0F14] border border-[#262B38] text-sm text-[#F1F3F5] placeholder-[#858B99]/50 focus:outline-none focus:border-[#D4F36B]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#858B99]">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3.5 text-[#858B99]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0F14] border border-[#262B38] text-sm text-[#F1F3F5] placeholder-[#858B99]/50 focus:outline-none focus:border-[#D4F36B]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#858B99]">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-[#858B99]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0F14] border border-[#262B38] text-sm text-[#F1F3F5] placeholder-[#858B99]/50 focus:outline-none focus:border-[#D4F36B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#D4F36B] hover:bg-[#bde050] text-[#0D0F14] font-bold text-sm transition-all shadow-md shadow-[#D4F36B]/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#858B99]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#D4F36B] hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

