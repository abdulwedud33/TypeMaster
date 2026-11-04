import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUserProgressData, getUserWeakKeys } from "@/lib/data-service";

export async function GET() {
  const user = await getCurrentUser();
  const userId = user ? user.id : "guest_user";

  const [progressData, weakKeys] = await Promise.all([
    getUserProgressData(userId),
    getUserWeakKeys(userId),
  ]);

  return NextResponse.json({
    ...progressData,
    weakKeys,
  });
}

