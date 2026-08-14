import { redirect } from "next/navigation";
import { fetchTrades } from "@/lib/notion";

export default async function HomePage() {
  const trades = await fetchTrades();

  // Filter trades dengan date valid
  const validTrades = trades.filter((t) => {
    const d = new Date(t.date);
    return !isNaN(d.getTime()) && t.date && t.date.length > 0;
  });

  if (validTrades.length === 0) {
    return (
      <div className="p-8 text-[#A6A39C]">
        <h1 className="text-2xl font-bold text-[#E8E6E1]">Belum ada data</h1>
        <p>Tambahkan data trading di Notion terlebih dahulu.</p>
      </div>
    );
  }

  // Cari bulan terbaru
  const latestTrade = validTrades.reduce((a, b) =>
    new Date(a.date) > new Date(b.date) ? a : b
  );
  const d = new Date(latestTrade.date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");

  redirect(`/month/${year}-${month}`);
}
