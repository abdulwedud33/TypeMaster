import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUserDashboardData } from "@/lib/data-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recentSessions, progress } = await getUserDashboardData(user.id);

  let csv = "TypeMaster Session Export\n";
  csv += `User,${user.name} (${user.email})\n`;
  csv += `Best WPM,${progress.bestWpm}\n`;
  csv += `Average Accuracy,${progress.averageAccuracy}%\n`;
  csv += `Total Practice Time (s),${progress.totalPracticeSeconds}\n`;
  csv += `Total Characters,${progress.totalCharactersTyped}\n\n`;

  csv += "Date,Type,Duration (s),WPM,Gross WPM,Accuracy (%),Correct Chars,Incorrect Chars,Total Keystrokes\n";

  for (const s of recentSessions) {
    csv += `"${s.completedAt}","${s.sessionType}",${s.durationSeconds},${s.wpm},${s.grossWpm || s.wpm},${s.accuracy},${s.correctCharacters},${s.incorrectCharacters},${s.totalKeystrokes || s.correctCharacters}\n`;
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="typemaster-stats-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

