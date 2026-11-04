import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  boolean,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  theme: text("theme").default("dark").notNull(),
  showVirtualKeyboard: boolean("show_virtual_keyboard").default(true).notNull(),
  showFingerGuide: boolean("show_finger_guide").default(true).notNull(),
  soundEnabled: boolean("sound_enabled").default(true).notNull(),
  dailyGoalMinutes: integer("daily_goal_minutes").default(15).notNull(),
  preferredTestDuration: integer("preferred_test_duration").default(60).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  currentLevel: integer("current_level").default(1).notNull(),
  lessonsCompleted: integer("lessons_completed").default(0).notNull(),
  totalPracticeSeconds: integer("total_practice_seconds").default(0).notNull(),
  totalCharactersTyped: integer("total_characters_typed").default(0).notNull(),
  bestWpm: doublePrecision("best_wpm").default(0).notNull(),
  averageAccuracy: doublePrecision("average_accuracy").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastPracticeDate: text("last_practice_date"), // YYYY-MM-DD
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  level: integer("level").notNull(),
  orderIndex: integer("order_index").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lessonType: text("lesson_type").notNull(), // 'home_row', 'top_row', 'bottom_row', etc.
  targetKeys: text("target_keys").notNull(), // e.g. "f,j" or "a,s,d,f"
  fingerNotes: text("finger_notes").notNull(),
  exercises: jsonb("exercises").$type<string[]>().notNull(),
}, (table) => [
  index("lesson_level_idx").on(table.level),
  index("lesson_order_idx").on(table.orderIndex),
]);

export const lessonAttempts = pgTable("lesson_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  wpm: doublePrecision("wpm").notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  correctCharacters: integer("correct_characters").notNull(),
  incorrectCharacters: integer("incorrect_characters").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("lesson_attempt_user_idx").on(table.userId),
  index("lesson_attempt_lesson_idx").on(table.lessonId),
]);

export const typingSessions = pgTable("typing_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionType: text("session_type").notNull(), // 'test', 'practice', 'weak_keys', 'custom'
  mode: text("mode").notNull(), // 'time_15', 'time_60', 'words_25', 'custom', etc.
  difficulty: text("difficulty").default("intermediate").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  wpm: doublePrecision("wpm").notNull(),
  grossWpm: doublePrecision("gross_wpm").notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  correctCharacters: integer("correct_characters").notNull(),
  incorrectCharacters: integer("incorrect_characters").notNull(),
  totalKeystrokes: integer("total_keystrokes").notNull(),
  backspaceCount: integer("backspace_count").default(0).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("session_user_idx").on(table.userId),
  index("session_type_idx").on(table.sessionType),
  index("session_completed_idx").on(table.completedAt),
]);

export const keyStatistics = pgTable("key_statistics", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  character: text("character").notNull(),
  totalAttempts: integer("total_attempts").default(0).notNull(),
  correctAttempts: integer("correct_attempts").default(0).notNull(),
  incorrectAttempts: integer("incorrect_attempts").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_character_unique").on(table.userId, table.character),
  index("key_stats_user_idx").on(table.userId),
]);

export const dailyActivity = pgTable("daily_activity", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activityDate: text("activity_date").notNull(), // YYYY-MM-DD
  practiceSeconds: integer("practice_seconds").default(0).notNull(),
  charactersTyped: integer("characters_typed").default(0).notNull(),
  lessonsCompleted: integer("lessons_completed").default(0).notNull(),
  testsCompleted: integer("tests_completed").default(0).notNull(),
}, (table) => [
  uniqueIndex("user_daily_activity_unique").on(table.userId, table.activityDate),
  index("daily_activity_user_idx").on(table.userId),
]);

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirementType: text("requirement_type").notNull(),
  requirementValue: integer("requirement_value").notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  achievementId: text("achievement_id")
    .notNull()
    .references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_achievement_unique").on(table.userId, table.achievementId),
  index("user_achievements_user_idx").on(table.userId),
]);

