import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { fetchTrades, getWeekNumber } from "@/lib/notion";

export const metadata: Metadata = {
  title: "EL-Documentary — Trading Journal",
  description: "Jurnal trading yang jujur.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trades = await fetchTrades();

  // Bangun data: bulan → minggu → hari
  const monthMap: Record<
    string,
    {
      year: number;
      month: number;
      name: string;
      count: number;
      weeks: Record<number, { count: number; days: Record<number, { count: number; grade?: string; result?: string }> }>;
    }
  > = {};

  for (const t of trades) {
    const d = new Date(t.date);
    if (isNaN(d.getTime())) continue;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    if (!monthMap[key]) {
      monthMap[key] = {
        year,
        month,
        name: d.toLocaleString("id", { month: "long" }),
        count: 0,
        weeks: {},
      };
    }
    monthMap[key].count++;

    const weekNum = getWeekNumber(d);
    if (!monthMap[key].weeks[weekNum]) {
      monthMap[key].weeks[weekNum] = { count: 0, days: {} };
    }
    monthMap[key].weeks[weekNum].count++;

    const day = d.getDate();
    if (!monthMap[key].weeks[weekNum].days[day]) {
      const grade = t.grade || 'B';
      const isWin = t.result === 'Win';
      const isLoss = t.result === 'Loss';
      let gradeColor = 'steel';
      if (grade === 'A' || grade === 'A+') gradeColor = 'gold';
      else if (isLoss) gradeColor = 'rust';
      else if (isWin) gradeColor = 'gold';

      monthMap[key].weeks[weekNum].days[day] = {
        count: 0,
        grade: gradeColor,
        result: isWin ? 'win' : isLoss ? 'loss' : 'be',
      };
    }
    monthMap[key].weeks[weekNum].days[day].count++;
  }

  const monthList = Object.keys(monthMap)
    .sort()
    .reverse()
    .map((key) => {
      const data = monthMap[key];
      return {
        key,
        name: data.name,
        year: data.year,
        count: data.count,
        weeks: Object.keys(data.weeks)
          .sort((a, b) => Number(a) - Number(b))
          .map((w) => {
            const weekData = data.weeks[Number(w)];
            return {
              key: `${key}-week-${w}`,
              number: Number(w),
              count: weekData.count,
              href: `/month/${key}/week/${w}`,
              days: Object.keys(weekData.days)
                .sort((a, b) => Number(a) - Number(b))
                .map((d) => ({
                  key: `${key}-week-${w}-day-${d}`,
                  date: Number(d),
                  href: `/month/${key}/week/${w}/day/${d}`,
                  grade: weekData.days[Number(d)].grade,
                  result: weekData.days[Number(d)].result,
                })),
            };
          }),
      };
    });

  return (
    <html lang="id">
      <body className="bg-[#0F0F0E] text-[#E8E6E1] antialiased">
        <Sidebar months={monthList} />
        <main
          className="min-h-screen transition-all duration-300 ease-in-out"
          style={{
            marginLeft: "var(--sidebar-width, 256px)",
            padding: "1.5rem 2rem 1.5rem 3rem",
            maxWidth: "calc(100% - var(--sidebar-width, 256px) + 40px)",
          }}
        >
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
