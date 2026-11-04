import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getLessonById } from "@/lib/data-service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const lesson = await getLessonById(id, user?.id);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json({ lesson });
}

