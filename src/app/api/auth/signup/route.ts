import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, schema, isDatabaseConfigured } from "@/db";
import { eq } from "drizzle-orm";
import { setSessionCookie } from "@/lib/session";
import { getOrCreateLocalUser } from "@/lib/data-service";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (isDatabaseConfigured && db) {
      // Check existing email
      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, cleanEmail));

      if (existing.length > 0) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }

      await db.insert(schema.users).values({
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
      });

      // Default user progress
      await db.insert(schema.userProgress).values({
        id: `prog_${userId}`,
        userId,
        currentLevel: 1,
        lessonsCompleted: 0,
        totalPracticeSeconds: 0,
        totalCharactersTyped: 0,
        bestWpm: 0,
        averageAccuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
      });

      // Default settings
      await db.insert(schema.userSettings).values({
        id: `set_${userId}`,
        userId,
        theme: "dark",
        showVirtualKeyboard: true,
        showFingerGuide: true,
        soundEnabled: true,
        dailyGoalMinutes: 15,
        preferredTestDuration: 60,
      });
    } else {
      const local = getOrCreateLocalUser(userId, name.trim(), cleanEmail);
      local.passwordHash = passwordHash;
    }

    await setSessionCookie({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
    });

    return NextResponse.json({
      success: true,
      user: { id: userId, name: name.trim(), email: cleanEmail },
    });
  } catch (err: any) {
    console.error("Sign up error:", err);
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 500 });
  }
}

