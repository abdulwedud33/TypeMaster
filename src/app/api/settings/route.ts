import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db, schema, isDatabaseConfigured } from "@/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({
      theme: "dark",
      showVirtualKeyboard: true,
      showFingerGuide: true,
      soundEnabled: true,
      dailyGoalMinutes: 15,
      preferredTestDuration: 60,
    });
  }

  if (isDatabaseConfigured && db) {
    try {
      const settings = await db
        .select()
        .from(schema.userSettings)
        .where(eq(schema.userSettings.userId, user.id));

      if (settings.length > 0) {
        return NextResponse.json(settings[0]);
      }
    } catch (err) {
      console.warn("DB settings fetch fallback:", err);
    }
  }

  return NextResponse.json({
    theme: "dark",
    showVirtualKeyboard: true,
    showFingerGuide: true,
    soundEnabled: true,
    dailyGoalMinutes: 15,
    preferredTestDuration: 60,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const body = await req.json();

  if (user && isDatabaseConfigured && db) {
    try {
      await db
        .insert(schema.userSettings)
        .values({
          id: `set_${user.id}`,
          userId: user.id,
          theme: body.theme || "dark",
          showVirtualKeyboard: body.showVirtualKeyboard ?? true,
          showFingerGuide: body.showFingerGuide ?? true,
          soundEnabled: body.soundEnabled ?? true,
          dailyGoalMinutes: body.dailyGoalMinutes || 15,
          preferredTestDuration: body.preferredTestDuration || 60,
        })
        .onConflictDoUpdate({
          target: schema.userSettings.userId,
          set: {
            theme: body.theme,
            showVirtualKeyboard: body.showVirtualKeyboard,
            showFingerGuide: body.showFingerGuide,
            soundEnabled: body.soundEnabled,
            dailyGoalMinutes: body.dailyGoalMinutes,
            preferredTestDuration: body.preferredTestDuration,
            updatedAt: new Date(),
          },
        });
    } catch (err) {
      console.warn("DB settings update fallback:", err);
    }
  }

  return NextResponse.json({ success: true, settings: body });
}

