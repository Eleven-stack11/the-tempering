import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { fetchTrades } from "@/lib/notion";

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

  // Proses data bulan
  const monthMap: Record<string, { year: number; month: number; name: string; count: number }> = {};
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
      };
    }
    monthMap[key].count++;
  }

  const monthList = Object.keys(monthMap)
    .sort()
    .reverse()
    .map((key) => ({
      key,
      name: monthMap[key].name,
      year: monthMap[key].year,
      count: monthMap[key].count,
    }));

  return (
    <html lang="id">
      <body className="bg-[#0F0F0E] text-[#E8E6E1] antialiased">
        <Sidebar months={monthList} />
        {/* Main content — margin-left mengikuti lebar sidebar */}
        <main
          className="min-h-screen transition-all duration-300 ease-in-out"
          style={{
            marginLeft: "var(--sidebar-width, 256px)",
            padding: "1.5rem 2rem 1.5rem 3rem",
            maxWidth: "calc(100% - var(--sidebar-width, 256px) + 40px)",
          }}
        >
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
