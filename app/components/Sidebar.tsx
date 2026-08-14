import Link from "next/link";
import { fetchTrades } from "@/lib/notion";

export default async function Sidebar() {
  const trades = await fetchTrades();

  // Filter trades yang memiliki date valid
  const validTrades = trades.filter((t) => {
    const d = new Date(t.date);
    return !isNaN(d.getTime()) && t.date && t.date.length > 0;
  });

  // Kelompokkan berdasarkan bulan
  const monthMap: Record<string, { year: number; month: number; name: string; count: number }> = {};
  for (const t of validTrades) {
    const d = new Date(t.date);
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

  const sortedKeys = Object.keys(monthMap).sort().reverse();

  return (
    <aside className="w-64 min-h-screen bg-[#171614] border-r border-[#221F1C] p-6 flex-shrink-0 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-8">
        <span className="w-1.5 h-1.5 bg-[#C49A3C] rotate-45 inline-block"></span>
        <span className="font-mono text-sm text-[#A6A39C] uppercase tracking-widest">EL-DOCUMENTARY</span>
      </div>

      {/* Daftar Bulan */}
      <nav>
        <h3 className="text-xs font-mono text-[#6E6B65] uppercase tracking-wider mb-4">Bulan</h3>
        {sortedKeys.length === 0 ? (
          <p className="text-xs text-[#6E6B65]">Belum ada data bulan.</p>
        ) : (
          <div className="space-y-1">
            {sortedKeys.map((key) => {
              const { year, month, name, count } = monthMap[key];
              return (
                <Link
                  key={key}
                  href={`/month/${key}`}
                  className="block py-1.5 px-3 rounded hover:bg-[#201F1C] text-[#A6A39C] hover:text-[#E8E6E1] transition text-sm"
                >
                  <span>{name} {year}</span>
                  <span className="text-[#6E6B65] text-xs ml-2">({count})</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
