import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, schema, isDatabaseConfigured } from "@/db";
import { eq } from "drizzle-orm";
import { setSessionCookie } from "@/lib/session";
import { getOrCreateLocalUser } from "@/lib/data-service";

export async function POST(req: Request) {
  try {
    const { email, password, isDemo } = await req.json();

    // Instant demo login
    if (isDemo) {
      const demoId = "demo_typist_1";
      getOrCreateLocalUser(demoId, "Demo Typist", "demo@typemaster.io");
      await setSessionCookie({
        id: demoId,
        name: "Demo Typist",
        email: "demo@typemaster.io",
        isDemo: true,
      });
      return NextResponse.json({
        success: true,
        user: { id: demoId, name: "Demo Typist", email: "demo@typemaster.io", isDemo: true },
      });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDatabaseConfigured && db) {
      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, cleanEmail));

      if (existing.length === 0) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const user = existing[0];
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      await setSessionCookie({
        id: user.id,
        name: user.name,
        email: user.email,
      });

      return NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } else {
      // Local fallback account
      const userId = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
      getOrCreateLocalUser(userId, "Typist", cleanEmail);
      await setSessionCookie({
        id: userId,
        name: "Typist",
        email: cleanEmail,
      });
      return NextResponse.json({
        success: true,
        user: { id: userId, name: "Typist", email: cleanEmail },
      });
    }
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}

