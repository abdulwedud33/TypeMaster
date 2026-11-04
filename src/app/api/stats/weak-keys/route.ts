import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUserWeakKeys } from "@/lib/data-service";

export async function GET() {
  const user = await getCurrentUser();
  const userId = user ? user.id : "guest_user";
  const weakKeys = await getUserWeakKeys(userId);

  return NextResponse.json({ weakKeys });
}

