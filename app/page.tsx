import { redirect } from "next/navigation";
import { fetchTrades } from "@/lib/notion";

export default async function HomePage() {
  const trades = await fetchTrades();

  if (trades.length === 0) {
    return (
      <div className="p-8 text-[#A6A39C]">
        <h1 className="text-2xl font-bold text-[#E8E6E1]">Belum ada data</h1>
        <p>Tambahkan data trading di Notion terlebih dahulu.</p>
      </div>
    );
  }

  // Cari bulan terbaru dari trade terbaru
  const latestTrade = trades.reduce((a, b) =>
    new Date(a.date) > new Date(b.date) ? a : b
  );
  const d = new Date(latestTrade.date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");

  redirect(`/month/${year}-${month}`);
}
