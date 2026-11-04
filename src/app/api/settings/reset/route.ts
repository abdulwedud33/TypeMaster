import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db, schema, isDatabaseConfigured } from "@/db";
import { eq } from "drizzle-orm";
import { getOrCreateLocalUser } from "@/lib/data-service";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDatabaseConfigured && db) {
    try {
      await db.delete(schema.lessonAttempts).where(eq(schema.lessonAttempts.userId, user.id));
      await db.delete(schema.typingSessions).where(eq(schema.typingSessions.userId, user.id));
      await db.delete(schema.keyStatistics).where(eq(schema.keyStatistics.userId, user.id));
      await db.delete(schema.dailyActivity).where(eq(schema.dailyActivity.userId, user.id));
      await db.delete(schema.userAchievements).where(eq(schema.userAchievements.userId, user.id));

      await db
        .update(schema.userProgress)
        .set({
          currentLevel: 1,
          lessonsCompleted: 0,
          totalPracticeSeconds: 0,
          totalCharactersTyped: 0,
          bestWpm: 0,
          averageAccuracy: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastPracticeDate: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.userProgress.userId, user.id));

      return NextResponse.json({ success: true, message: "Progress reset successfully" });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Reset local state
  const local = getOrCreateLocalUser(user.id);
  local.sessions = [];
  local.lessonAttempts = {};
  local.keyStats = {};
  local.daily = {};
  local.progress = {
    currentLevel: 1,
    lessonsCompleted: 0,
    totalPracticeSeconds: 0,
    totalCharactersTyped: 0,
    bestWpm: 0,
    averageAccuracy: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
  };

  return NextResponse.json({ success: true, message: "Progress reset successfully" });
}

