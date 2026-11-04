import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getCurriculumLessons } from "@/lib/data-service";

export async function GET() {
  const user = await getCurrentUser();
  const lessons = await getCurriculumLessons(user?.id);
  return NextResponse.json({ lessons });
}

