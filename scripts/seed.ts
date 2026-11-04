import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { SEED_LESSONS, SEED_ACHIEVEMENTS } from "../src/db/seed-data";

loadEnvConfig(process.cwd());

async function runSeed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  console.log("Seeding lessons...");
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

  console.log("Seeding achievements...");
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

  console.log("Seed completed successfully!");
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

