import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { recordTypingResult } from "@/lib/data-service";
import { TypingResultData } from "@/components/results-modal";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const data: TypingResultData = await req.json();

    const userId = user ? user.id : "guest_user";
    await recordTypingResult(userId, data);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error saving typing session:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

