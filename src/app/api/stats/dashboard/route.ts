import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUserDashboardData, getCurriculumLessons } from "@/lib/data-service";

export async function GET() {
  const user = await getCurrentUser();
  const userId = user ? user.id : "guest_user";

  const data = await getUserDashboardData(userId);
  const lessons = await getCurriculumLessons(userId);

  // Find next incomplete lesson
  const nextLesson = lessons.find((l) => !l.completed) || lessons[0];

  return NextResponse.json({
    user,
    progress: data.progress,
    recentSessions: data.recentSessions,
    weeklyActivity: data.weeklyActivity,
    recommendedLesson: nextLesson,
  });
}

