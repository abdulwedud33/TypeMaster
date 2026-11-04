import { db, schema, isDatabaseConfigured } from "@/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { SEED_LESSONS, SEED_ACHIEVEMENTS } from "@/db/seed-data";
import { TypingResultData } from "@/components/results-modal";

// Local in-memory store for guest/demo sessions or offline fallback
interface LocalStoreUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  progress: {
    currentLevel: number;
    lessonsCompleted: number;
    totalPracticeSeconds: number;
    totalCharactersTyped: number;
    bestWpm: number;
    averageAccuracy: number;
    currentStreak: number;
    longestStreak: number;
    lastPracticeDate: string | null;
  };
  sessions: TypingResultData[];
  lessonAttempts: Record<string, { wpm: number; accuracy: number; completedAt: string }>;
  keyStats: Record<string, { correct: number; incorrect: number }>;
  daily: Record<string, { practiceSeconds: number; charactersTyped: number; lessons: number; tests: number }>;
  unlockedAchievements: string[];
}

const memoryStore: Record<string, LocalStoreUser> = {};

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function getOrCreateLocalUser(
  userId: string,
  name = "Demo Typist",
  email = "demo@typemaster.local"
): LocalStoreUser {
  if (!memoryStore[userId]) {
    memoryStore[userId] = {
      id: userId,
      name,
      email,
      passwordHash: "",
      progress: {
        currentLevel: 1,
        lessonsCompleted: 0,
        totalPracticeSeconds: 0,
        totalCharactersTyped: 0,
        bestWpm: 0,
        averageAccuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
      },
      sessions: [],
      lessonAttempts: {},
      keyStats: {},
      daily: {},
      unlockedAchievements: [],
    };
  }
  return memoryStore[userId];
}

// ----------------- CURRICULUM & LESSONS -----------------

export async function getCurriculumLessons(userId?: string) {
  if (isDatabaseConfigured && db) {
    try {
      const dbLessons = await db
        .select()
        .from(schema.lessons)
        .orderBy(schema.lessons.orderIndex);

      if (dbLessons.length > 0) {
        let attempts: any[] = [];
        if (userId) {
          attempts = await db
            .select()
            .from(schema.lessonAttempts)
            .where(eq(schema.lessonAttempts.userId, userId));
        }

        const attemptMap = new Map<string, { wpm: number; accuracy: number }>();
        for (const a of attempts) {
          const existing = attemptMap.get(a.lessonId);
          if (!existing || a.wpm > existing.wpm) {
            attemptMap.set(a.lessonId, { wpm: a.wpm, accuracy: a.accuracy });
          }
        }

        return dbLessons.map((l) => ({
          ...l,
          completed: attemptMap.has(l.id),
          bestWpm: attemptMap.get(l.id)?.wpm || null,
          bestAccuracy: attemptMap.get(l.id)?.accuracy || null,
        }));
      }
    } catch (e) {
      console.warn("Database lessons lookup fallback to seed:", e);
    }
  }

  // Local fallback
  const localUser = userId ? getOrCreateLocalUser(userId) : null;
  return SEED_LESSONS.map((l) => {
    const attempt = localUser?.lessonAttempts[l.id];
    return {
      ...l,
      completed: Boolean(attempt),
      bestWpm: attempt?.wpm || null,
      bestAccuracy: attempt?.accuracy || null,
    };
  });
}

export async function getLessonById(lessonId: string, userId?: string) {
  const all = await getCurriculumLessons(userId);
  return all.find((l) => l.id === lessonId) || null;
}

// ----------------- RECORD LESSON & SESSION -----------------

export async function recordTypingResult(userId: string, data: TypingResultData) {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (isDatabaseConfigured && db) {
    try {
      // 1. Record individual lesson attempt or session
      if (data.sessionType === "lesson" && data.lessonId) {
        await db.insert(schema.lessonAttempts).values({
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId,
          lessonId: data.lessonId,
          wpm: data.wpm,
          accuracy: data.accuracy,
          correctCharacters: data.correctCharacters,
          incorrectCharacters: data.incorrectCharacters,
          durationSeconds: Math.max(1, Math.round(data.durationSeconds)),
        });
      }

      await db.insert(schema.typingSessions).values({
        id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        sessionType: data.sessionType,
        mode: data.sessionType === "test" ? `time_${Math.round(data.durationSeconds)}` : "practice",
        difficulty: "intermediate",
        durationSeconds: Math.max(1, Math.round(data.durationSeconds)),
        wpm: data.wpm,
        grossWpm: data.grossWpm,
        accuracy: data.accuracy,
        correctCharacters: data.correctCharacters,
        incorrectCharacters: data.incorrectCharacters,
        totalKeystrokes: data.totalKeystrokes,
        backspaceCount: data.backspaceCount,
      });

      // 2. Count UNIQUE lessons completed by this user
      const uniqueLessonRows = await db
        .select({ lessonId: schema.lessonAttempts.lessonId })
        .from(schema.lessonAttempts)
        .where(eq(schema.lessonAttempts.userId, userId));

      const uniqueLessonSet = new Set(uniqueLessonRows.map((r) => r.lessonId));
      if (data.sessionType === "lesson" && data.lessonId) {
        uniqueLessonSet.add(data.lessonId);
      }
      const distinctLessonsCompleted = uniqueLessonSet.size;

      // Compute current level based on distinct lessons completed (approx 3-4 lessons per level)
      const computedLevel = Math.min(10, Math.max(1, Math.floor(distinctLessonsCompleted / 3.5) + 1));

      // 3. Update User Progress & Streaks
      const existingProgress = await db
        .select()
        .from(schema.userProgress)
        .where(eq(schema.userProgress.userId, userId));

      let progress = existingProgress[0];

      if (!progress) {
        await db.insert(schema.userProgress).values({
          id: `prog_${userId}`,
          userId,
          currentLevel: computedLevel,
          lessonsCompleted: distinctLessonsCompleted,
          totalPracticeSeconds: Math.max(1, Math.round(data.durationSeconds)),
          totalCharactersTyped: data.correctCharacters,
          bestWpm: data.wpm,
          averageAccuracy: data.accuracy,
          currentStreak: 1,
          longestStreak: 1,
          lastPracticeDate: today,
        });
      } else {
        const lastDate = progress.lastPracticeDate;
        let newStreak = progress.currentStreak;

        if (lastDate === yesterday) {
          // Practiced consecutive day: increase streak
          newStreak += 1;
        } else if (lastDate === today) {
          // Already practiced today: keep current streak
          newStreak = progress.currentStreak;
        } else {
          // Missed at least one day: restart streak at 1
          newStreak = 1;
        }

        const longestStreak = Math.max(progress.longestStreak, newStreak);
        const newTotalSecs = progress.totalPracticeSeconds + Math.max(1, Math.round(data.durationSeconds));
        const newTotalChars = progress.totalCharactersTyped + data.correctCharacters;
        const newBestWpm = Math.max(progress.bestWpm, data.wpm);

        // Weighted rolling average accuracy
        const newAvgAccuracy =
          progress.averageAccuracy === 0 || progress.totalPracticeSeconds === 0
            ? data.accuracy
            : Math.round(((progress.averageAccuracy * 0.85) + (data.accuracy * 0.15)) * 10) / 10;

        await db
          .update(schema.userProgress)
          .set({
            currentLevel: computedLevel,
            lessonsCompleted: distinctLessonsCompleted,
            totalPracticeSeconds: newTotalSecs,
            totalCharactersTyped: newTotalChars,
            bestWpm: newBestWpm,
            averageAccuracy: newAvgAccuracy,
            currentStreak: newStreak,
            longestStreak,
            lastPracticeDate: today,
            updatedAt: new Date(),
          })
          .where(eq(schema.userProgress.userId, userId));
      }

      // 4. Upsert Daily Activity for Today
      const existingDaily = await db
        .select()
        .from(schema.dailyActivity)
        .where(and(eq(schema.dailyActivity.userId, userId), eq(schema.dailyActivity.activityDate, today)));

      const durationSecs = Math.max(1, Math.round(data.durationSeconds));

      if (existingDaily.length > 0) {
        await db
          .update(schema.dailyActivity)
          .set({
            practiceSeconds: existingDaily[0].practiceSeconds + durationSecs,
            charactersTyped: existingDaily[0].charactersTyped + data.correctCharacters,
            lessonsCompleted: existingDaily[0].lessonsCompleted + (data.sessionType === "lesson" ? 1 : 0),
            testsCompleted: existingDaily[0].testsCompleted + (data.sessionType === "test" ? 1 : 0),
          })
          .where(eq(schema.dailyActivity.id, existingDaily[0].id));
      } else {
        await db.insert(schema.dailyActivity).values({
          id: `act_${Date.now()}`,
          userId,
          activityDate: today,
          practiceSeconds: durationSecs,
          charactersTyped: data.correctCharacters,
          lessonsCompleted: data.sessionType === "lesson" ? 1 : 0,
          testsCompleted: data.sessionType === "test" ? 1 : 0,
        });
      }

      // 5. Update Key Statistics
      for (const [char, count] of Object.entries(data.mistypedKeys)) {
        await db
          .insert(schema.keyStatistics)
          .values({
            id: `k_${userId}_${encodeURIComponent(char)}`,
            userId,
            character: char,
            totalAttempts: count,
            correctAttempts: 0,
            incorrectAttempts: count,
          })
          .onConflictDoUpdate({
            target: [schema.keyStatistics.userId, schema.keyStatistics.character],
            set: {
              totalAttempts: sql`${schema.keyStatistics.totalAttempts} + ${count}`,
              incorrectAttempts: sql`${schema.keyStatistics.incorrectAttempts} + ${count}`,
              updatedAt: new Date(),
            },
          });
      }

      for (const [char, count] of Object.entries(data.correctKeys)) {
        await db
          .insert(schema.keyStatistics)
          .values({
            id: `k_${userId}_${encodeURIComponent(char)}`,
            userId,
            character: char,
            totalAttempts: count,
            correctAttempts: count,
            incorrectAttempts: 0,
          })
          .onConflictDoUpdate({
            target: [schema.keyStatistics.userId, schema.keyStatistics.character],
            set: {
              totalAttempts: sql`${schema.keyStatistics.totalAttempts} + ${count}`,
              correctAttempts: sql`${schema.keyStatistics.correctAttempts} + ${count}`,
              updatedAt: new Date(),
            },
          });
      }

      // 6. Check and Unlock Milestone Achievements
      await checkAndUnlockAchievements(userId, data);

      return { success: true };
    } catch (err) {
      console.error("Neon DB save failed, persisting locally:", err);
    }
  }

  // Local Memory Fallback
  const user = getOrCreateLocalUser(userId);
  user.sessions.unshift(data);

  if (data.sessionType === "lesson" && data.lessonId) {
    user.lessonAttempts[data.lessonId] = {
      wpm: data.wpm,
      accuracy: data.accuracy,
      completedAt: data.completedAt,
    };
    user.progress.lessonsCompleted = Object.keys(user.lessonAttempts).length;
    user.progress.currentLevel = Math.min(10, Math.max(1, Math.floor(user.progress.lessonsCompleted / 3.5) + 1));
  }

  const durationSecs = Math.max(1, Math.round(data.durationSeconds));
  user.progress.totalPracticeSeconds += durationSecs;
  user.progress.totalCharactersTyped += data.correctCharacters;
  user.progress.bestWpm = Math.max(user.progress.bestWpm, data.wpm);
  user.progress.averageAccuracy =
    user.progress.averageAccuracy === 0
      ? data.accuracy
      : Math.round(((user.progress.averageAccuracy * 0.85) + (data.accuracy * 0.15)) * 10) / 10;

  if (user.progress.lastPracticeDate === yesterday) {
    user.progress.currentStreak += 1;
  } else if (user.progress.lastPracticeDate === today) {
    // Keep streak
  } else {
    user.progress.currentStreak = 1;
  }
  user.progress.longestStreak = Math.max(user.progress.longestStreak, user.progress.currentStreak);
  user.progress.lastPracticeDate = today;

  // Daily
  if (!user.daily[today]) {
    user.daily[today] = { practiceSeconds: 0, charactersTyped: 0, lessons: 0, tests: 0 };
  }
  user.daily[today].practiceSeconds += durationSecs;
  user.daily[today].charactersTyped += data.correctCharacters;
  if (data.sessionType === "lesson") user.daily[today].lessons += 1;
  if (data.sessionType === "test") user.daily[today].tests += 1;

  // Key stats
  for (const [char, count] of Object.entries(data.mistypedKeys)) {
    if (!user.keyStats[char]) user.keyStats[char] = { correct: 0, incorrect: 0 };
    user.keyStats[char].incorrect += count;
  }
  for (const [char, count] of Object.entries(data.correctKeys)) {
    if (!user.keyStats[char]) user.keyStats[char] = { correct: 0, incorrect: 0 };
    user.keyStats[char].correct += count;
  }

  return { success: true };
}

// ----------------- MILESTONE ACHIEVEMENTS CHECKER -----------------

async function checkAndUnlockAchievements(userId: string, data: TypingResultData) {
  if (!isDatabaseConfigured || !db) return;
  try {
    const progressList = await db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, userId));
    const progress = progressList[0];
    if (!progress) return;

    const allAchievements = await db.select().from(schema.achievements);
    const existingUnlocked = await db
      .select({ id: schema.userAchievements.achievementId })
      .from(schema.userAchievements)
      .where(eq(schema.userAchievements.userId, userId));

    const unlockedSet = new Set(existingUnlocked.map((u) => u.id));

    for (const ach of allAchievements) {
      if (unlockedSet.has(ach.id)) continue;

      let eligible = false;
      switch (ach.requirementType) {
        case "lessons_completed":
          eligible = progress.lessonsCompleted >= ach.requirementValue;
          break;
        case "wpm_reached":
          eligible = progress.bestWpm >= ach.requirementValue;
          break;
        case "accuracy_reached":
          eligible = data.accuracy >= ach.requirementValue;
          break;
        case "streak_days":
          eligible = progress.currentStreak >= ach.requirementValue;
          break;
        case "characters_typed":
          eligible = progress.totalCharactersTyped >= ach.requirementValue;
          break;
      }

      if (eligible) {
        await db.insert(schema.userAchievements).values({
          id: `uach_${Date.now()}_${ach.id}`,
          userId,
          achievementId: ach.id,
        }).onConflictDoNothing();
      }
    }
  } catch (err) {
    console.warn("Achievement check warning:", err);
  }
}

// ----------------- DASHBOARD & STATS -----------------

export async function getUserDashboardData(userId: string) {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (isDatabaseConfigured && db) {
    try {
      const progressRes = await db
        .select()
        .from(schema.userProgress)
        .where(eq(schema.userProgress.userId, userId));

      const sessions = await db
        .select()
        .from(schema.typingSessions)
        .where(eq(schema.typingSessions.userId, userId))
        .orderBy(desc(schema.typingSessions.completedAt))
        .limit(10);

      const daily = await db
        .select()
        .from(schema.dailyActivity)
        .where(eq(schema.dailyActivity.userId, userId))
        .orderBy(desc(schema.dailyActivity.activityDate))
        .limit(7);

      const progress = progressRes[0] || {
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

      // Accurate streak verification
      const isStreakActive =
        progress.lastPracticeDate === today || progress.lastPracticeDate === yesterday;
      const displayStreak = isStreakActive ? progress.currentStreak : 0;

      return {
        progress: {
          ...progress,
          currentStreak: displayStreak,
        },
        recentSessions: sessions,
        weeklyActivity: daily.reverse(),
      };
    } catch (err) {
      console.warn("DB dashboard query fallback:", err);
    }
  }

  const local = getOrCreateLocalUser(userId);
  const isStreakActive =
    local.progress.lastPracticeDate === today || local.progress.lastPracticeDate === yesterday;

  const weekly = Object.entries(local.daily)
    .slice(-7)
    .map(([date, val]) => ({
      activityDate: date,
      practiceSeconds: val.practiceSeconds,
      charactersTyped: val.charactersTyped,
      lessonsCompleted: val.lessons,
      testsCompleted: val.tests,
    }));

  return {
    progress: {
      ...local.progress,
      currentStreak: isStreakActive ? local.progress.currentStreak : 0,
    },
    recentSessions: local.sessions.slice(0, 10),
    weeklyActivity: weekly,
  };
}

// ----------------- LONGITUDINAL PROGRESS (90 DAYS & HEATMAP) -----------------

export async function getUserProgressData(userId: string) {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (isDatabaseConfigured && db) {
    try {
      const progressRes = await db
        .select()
        .from(schema.userProgress)
        .where(eq(schema.userProgress.userId, userId));

      const sessions = await db
        .select()
        .from(schema.typingSessions)
        .where(eq(schema.typingSessions.userId, userId))
        .orderBy(desc(schema.typingSessions.completedAt))
        .limit(50);

      // Fetch full past 90 days for heatmap
      const daily = await db
        .select()
        .from(schema.dailyActivity)
        .where(eq(schema.dailyActivity.userId, userId))
        .orderBy(desc(schema.dailyActivity.activityDate))
        .limit(90);

      // Unlocked user achievements
      const userAchs = await db
        .select({
          achievementId: schema.userAchievements.achievementId,
          unlockedAt: schema.userAchievements.unlockedAt,
        })
        .from(schema.userAchievements)
        .where(eq(schema.userAchievements.userId, userId));

      const progress = progressRes[0] || {
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

      const isStreakActive =
        progress.lastPracticeDate === today || progress.lastPracticeDate === yesterday;

      return {
        progress: {
          ...progress,
          currentStreak: isStreakActive ? progress.currentStreak : 0,
        },
        recentSessions: sessions,
        heatmapActivity: daily.reverse(),
        unlockedAchievements: userAchs.map((a) => a.achievementId),
      };
    } catch (err) {
      console.warn("DB progress query fallback:", err);
    }
  }

  const local = getOrCreateLocalUser(userId);
  const isStreakActive =
    local.progress.lastPracticeDate === today || local.progress.lastPracticeDate === yesterday;

  const dailyList = Object.entries(local.daily)
    .slice(-90)
    .map(([date, val]) => ({
      activityDate: date,
      practiceSeconds: val.practiceSeconds,
      charactersTyped: val.charactersTyped,
      lessonsCompleted: val.lessons,
      testsCompleted: val.tests,
    }));

  return {
    progress: {
      ...local.progress,
      currentStreak: isStreakActive ? local.progress.currentStreak : 0,
    },
    recentSessions: local.sessions.slice(0, 50),
    heatmapActivity: dailyList,
    unlockedAchievements: local.unlockedAchievements,
  };
}

// ----------------- WEAK KEY RECOMMENDATIONS -----------------

export async function getUserWeakKeys(userId: string) {
  if (isDatabaseConfigured && db) {
    try {
      const stats = await db
        .select()
        .from(schema.keyStatistics)
        .where(eq(schema.keyStatistics.userId, userId));

      return stats
        .filter((s) => s.incorrectAttempts > 0)
        .map((s) => {
          const accuracy =
            s.totalAttempts > 0
              ? Math.round((s.correctAttempts / s.totalAttempts) * 100)
              : 0;
          return {
            character: s.character,
            total: s.totalAttempts,
            errors: s.incorrectAttempts,
            accuracy,
          };
        })
        .sort((a, b) => b.errors - a.errors)
        .slice(0, 8);
    } catch (err) {
      console.warn("DB weak keys query fallback:", err);
    }
  }

  const local = getOrCreateLocalUser(userId);
  return Object.entries(local.keyStats)
    .filter(([_, stats]) => stats.incorrect > 0)
    .map(([char, stats]) => {
      const total = stats.correct + stats.incorrect;
      const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
      return {
        character: char,
        total,
        errors: stats.incorrect,
        accuracy,
      };
    })
    .sort((a, b) => b.errors - a.errors)
    .slice(0, 8);
}
