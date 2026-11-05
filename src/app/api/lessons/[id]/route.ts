import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getLessonById, getCurriculumLessons } from "@/lib/data-service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const [lesson, allLessons] = await Promise.all([
    getLessonById(id, user?.id),
    getCurriculumLessons(user?.id),
  ]);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Calculate level status to enforce that next levels are locked until previous is completed
  const levelStatus: Record<number, { isUnlocked: boolean; isCompleted: boolean }> = {};
  for (let lvl = 1; lvl <= 10; lvl++) {
    const lvlLessons = allLessons.filter((l) => l.level === lvl);
    const completedCount = lvlLessons.filter((l) => l.completed).length;
    const isCompleted = lvlLessons.length > 0 && completedCount === lvlLessons.length;
    const isUnlocked = lvl === 1 ? true : Boolean(levelStatus[lvl - 1]?.isCompleted);
    levelStatus[lvl] = { isUnlocked, isCompleted };
  }

  const isLevelUnlocked = levelStatus[lesson.level]?.isUnlocked ?? true;
  const isLessonUnlocked = (lesson.unlocked ?? true) && isLevelUnlocked;

  return NextResponse.json({
    lesson,
    isLevelUnlocked,
    isLessonUnlocked,
    levelStatus,
  });
}

