import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
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

  // Bangun data bulan + minggu
  const monthMap: Record<
    string,
    {
      year: number;
      month: number;
      name: string;
      count: number;
      weeks: Record<number, number>;
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
    monthMap[key].weeks[weekNum] = (monthMap[key].weeks[weekNum] || 0) + 1;
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
          .map((w) => ({
            key: `${key}-week-${w}`,
            number: Number(w),
            count: data.weeks[Number(w)],
            href: `/month/${key}/week/${w}`,
          })),
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
          <div className="max-w-6xl mx-auto">
            {/* TopNav — muncul di semua halaman kecuali homepage */}
            <TopNav />
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
