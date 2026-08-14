import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { fetchTrades, getWeekNumber } from "@/lib/notion";

export const metadata: Metadata = {
  title: "EL-Documentary — Trading Journal",
  description: "Jurnal trading yang jujur.",
};

function buildTree(trades: any[]) {
  const validTrades = trades.filter(t => {
    const d = new Date(t.date);
    return !isNaN(d.getTime()) && t.date && t.date.length > 0;
  });

  const tree: any = {};

  for (const trade of validTrades) {
    const d = new Date(trade.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthName = d.toLocaleString('id', { month: 'long' });
    const weekNumber = getWeekNumber(d);
    const day = d.getDate();

    if (!tree[year]) tree[year] = {};
    if (!tree[year][month]) tree[year][month] = { name: monthName, weeks: {} };
    if (!tree[year][month].weeks[weekNumber]) tree[year][month].weeks[weekNumber] = { days: {} };
    if (!tree[year][month].weeks[weekNumber].days[day]) {
      tree[year][month].weeks[weekNumber].days[day] = [];
    }
    tree[year][month].weeks[weekNumber].days[day].push(trade);
  }

  const result = Object.keys(tree).sort().reverse().map(year => {
    const yearNode: any = {
      key: year,
      label: String(year),
      icon: 'folder',
      children: []
    };
    const months = Object.keys(tree[year]).sort((a, b) => Number(b) - Number(a));
    for (const month of months) {
      const monthData = tree[year][month];
      const monthNode: any = {
        key: `${year}-${month}`,
        label: monthData.name,
        href: `/month/${year}-${month}`,
        icon: 'calendar',
        count: validTrades.filter(t => {
          const d = new Date(t.date);
          return d.getFullYear() === Number(year) && d.getMonth() === Number(month) - 1;
        }).length,
        children: []
      };
      const weeks = Object.keys(monthData.weeks).sort((a, b) => Number(a) - Number(b));
      for (const week of weeks) {
        const weekData = monthData.weeks[week];
        const weekNode: any = {
          key: `${year}-${month}-week-${week}`,
          label: `Minggu ${week}`,
          href: `/month/${year}-${month}/week/${week}`,
          icon: 'file',
          count: Object.keys(weekData.days).reduce((acc, day) => acc + weekData.days[day].length, 0),
          children: []
        };
        const days = Object.keys(weekData.days).sort((a, b) => Number(a) - Number(b));
        for (const day of days) {
          const dayTrades = weekData.days[day];
          const grade = dayTrades[0]?.grade || 'B';
          const isWin = dayTrades[0]?.result === 'Win';
          const isLoss = dayTrades[0]?.result === 'Loss';
          let gradeColor = 'steel';
          if (grade === 'A' || grade === 'A+') gradeColor = 'gold';
          else if (isLoss) gradeColor = 'rust';
          else if (isWin) gradeColor = 'gold';

          const dayNode: any = {
            key: `${year}-${month}-week-${week}-day-${day}`,
            label: `${day} ${monthData.name}`,
            href: `/month/${year}-${month}/week/${week}/day/${day}`,
            icon: 'file',
            count: dayTrades.length,
            grade: gradeColor,
            gradeLabel: grade,
            result: isWin ? 'win' : isLoss ? 'loss' : 'be',
          };
          weekNode.children.push(dayNode);
        }
        monthNode.children.push(weekNode);
      }
      yearNode.children.push(monthNode);
    }
    return yearNode;
  });

  return result;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trades = await fetchTrades();
  const treeData = buildTree(trades);

  return (
    <html lang="id">
      <body className="bg-[#0F0F0E] text-[#E8E6E1] antialiased flex">
        <Sidebar treeData={treeData} />
        <main className="flex-1 min-h-screen p-6 transition-all duration-300 ml-64">
          {children}
        </main>
      </body>
    </html>
  );
}
