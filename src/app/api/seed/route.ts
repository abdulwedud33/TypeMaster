import { NextResponse } from "next/server";
import { db, schema, isDatabaseConfigured } from "@/db";
import { SEED_LESSONS, SEED_ACHIEVEMENTS } from "@/db/seed-data";

export async function POST() {
  if (!isDatabaseConfigured || !db) {
    return NextResponse.json({
      message: "Neon database is not configured yet. Using embedded rich curriculum!",
      configured: false,
    });
  }

  try {
    for (const lesson of SEED_LESSONS) {
      await db
        .insert(schema.lessons)
        .values(lesson)
        .onConflictDoUpdate({
          target: schema.lessons.id,
          set: {
            title: lesson.title,
            description: lesson.description,
            level: lesson.level,
            orderIndex: lesson.orderIndex,
            lessonType: lesson.lessonType,
            targetKeys: lesson.targetKeys,
            fingerNotes: lesson.fingerNotes,
            exercises: lesson.exercises,
          },
        });
    }

    for (const ach of SEED_ACHIEVEMENTS) {
      await db
        .insert(schema.achievements)
        .values(ach)
        .onConflictDoUpdate({
          target: schema.achievements.id,
          set: {
            title: ach.title,
            description: ach.description,
            icon: ach.icon,
            requirementType: ach.requirementType,
            requirementValue: ach.requirementValue,
          },
        });
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${SEED_LESSONS.length} lessons and ${SEED_ACHIEVEMENTS.length} achievements!`,
    });
  } catch (err: any) {
    console.error("Seeding error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

