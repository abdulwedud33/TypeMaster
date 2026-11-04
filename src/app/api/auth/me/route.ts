import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUserDashboardData } from "@/lib/data-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, progress: null });
  }

  const { progress } = await getUserDashboardData(user.id);
  return NextResponse.json({ user, progress });
}

