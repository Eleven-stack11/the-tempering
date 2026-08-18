import Link from "next/link";
import { fetchTrades } from "@/lib/notion";

export const revalidate = 60;

const monthNames: Record<string, string> = {
  "01": "Januari",
  "02": "Februari",
  "03": "Maret",
  "04": "April",
  "05": "Mei",
  "06": "Juni",
  "07": "Juli",
  "08": "Agustus",
  "09": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Desember",
};

export default async function HomePage() {
  const allTrades = await fetchTrades();

  const trades = allTrades.filter((t) => t.status === "Entered" && t.isTrade === true);

  const monthMap: Record<string, any[]> = {};
  for (const t of trades) {
    const d = new Date(t.date);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(t);
  }

  const monthKeys = Object.keys(monthMap).sort().reverse();

  const totalSessions = trades.length;
  const setupA = trades.filter((t) => t.grade === "A").length;
  const violations = 0;
  const netR = trades.reduce(
    (sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0),
    0
  );

  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <header className="mb-8">
        <div className="font-mono text-xs tracking-widest text-[#C49A3C] uppercase mb-2">
          TRADING LOG
        </div>
        <h1 className="font-['Big_Shoulders'] font-black text-5xl md:text-7xl leading-none text-white">
          <em className="text-[#2E5695] not-italic">Journey</em>
        </h1>
      </header>

      <div className="h-[1px] bg-[#221F1C] w-full mb-8" />

      {/* Grid 4 Kolom Sesi/Statistik */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#1A1918] border border-[#2C2A27] rounded-lg p-5">
            <div className="font-mono text-[11px] tracking-wider uppercase text-[#6E6B65] mb-2">
              Sesi Tercatat
            </div>
            <div className="font-['Big_Shoulders'] text-3xl font-extrabold text-white">
              {totalSessions}
            </div>
          </div>

          <div className="bg-[#1A1918] border border-[#2C2A27] rounded-lg p-5">
            <div className="font-mono text-[11px] tracking-wider uppercase text-[#6E6B65] mb-2">
              Setup A+ / A
            </div>
            <div className="font-['Big_Shoulders'] text-3xl font-extrabold text-[#C49A3C]">
              {setupA}
            </div>
          </div>

          <div className="bg-[#1A1918] border border-[#2C2A27] rounded-lg p-5">
            <div className="font-mono text-[11px] tracking-wider uppercase text-[#6E6B65] mb-2">
              Pelanggaran
            </div>
            <div className="font-['Big_Shoulders'] text-3xl font-extrabold text-[#8B3A1F]">
              {violations}
            </div>
          </div>

          <div className="bg-[#1A1918] border border-[#2C2A27] rounded-lg p-5">
            <div className="font-mono text-[11px] tracking-wider uppercase text-[#6E6B65] mb-2">
              Net R
            </div>
            <div
              className={`font-['Big_Shoulders'] text-3xl font-extrabold ${
                netR >= 0 ? "text-[#2E5695]" : "text-[#8B3A1F]"
              }`}
            >
              {netR >= 0 ? "+" : ""}
              {netR.toFixed(1)}R
            </div>
          </div>
        </div>
      </section>

      {/* Kartu Bulan */}
      <section className="mb-16">
        <h2 className="font-['Big_Shoulders'] text-3xl font-bold text-white mb-4">
          2026
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {monthKeys.map((key) => {
            const [, month] = key.split("-");
            const monthName = monthNames[month] || month;
            const monthTrades = monthMap[key];
            return (
              <Link
                key={key}
                href={`/month/${key}`}
                className="bg-[#1A1918] border border-[#2C2A27] rounded-lg p-5 hover:border-[#3D3A35] hover:bg-[#201F1C] transition-all block"
              >
                <div className="flex items-center justify-between font-mono text-[11px] text-[#6E6B65] uppercase tracking-wider mb-2">
                  <span>BULAN {month}</span>
                  <span>→</span>
                </div>
                <h3 className="font-['Big_Shoulders'] text-3xl font-bold text-white mb-1">
                  {monthName}
                </h3>
                <p className="text-xs text-[#A6A39C] mb-4">
                  {monthTrades.length} trade tercatat
                </p>

                {/* Teks terpisah rapi kiri-kanan */}
                <div className="flex items-center justify-between pt-3 border-t border-[#221F1C] font-mono text-xs">
                  <span className="text-[#A6A39C]">
                    <b className="text-white font-bold">{monthTrades.length}</b> trade
                  </span>
                  <span className="text-[#A6A39C] font-semibold">NQ / ES</span>
                </div>
              </Link>
            );
          })}

          <div className="bg-[#1A1918]/50 border border-[#2C2A27] rounded-lg p-5 opacity-60">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#6E6B65] uppercase tracking-wider mb-2">
              <span>BULAN 09</span>
              <span>🔒</span>
            </div>
            <h3 className="font-['Big_Shoulders'] text-3xl font-bold text-white mb-1">
              September
            </h3>
            <p className="text-xs text-[#6E6B65]">Belum ditempa.</p>
          </div>
        </div>
      </section>

      {/* Footer & Filosofi Kiri-Kanan */}
      <footer className="pt-8 border-t border-[#221F1C]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Kiri */}
          <div className="text-left">
            <h4 className="text-base font-semibold text-white mb-1">
              "Shokunin 職人."
            </h4>
            <p className="text-xs text-[#A6A39C] leading-relaxed">
              Bentuk pelatihan mencari kesempurnaan dengan sadar bahwa itu mustahil dicapai.
            </p>
          </div>

          {/* Kanan */}
          <div className="text-right">
            <h4 className="text-base font-semibold text-white mb-1">
              "Kaizen 改善."
            </h4>
            <p className="text-xs text-[#A6A39C] leading-relaxed">
              Proses menjadi lebih baik 1% setiap hari — perbaikan berkelanjutan.
            </p>
          </div>
        </div>

        {/* Tagline Bawah Full-Width Center */}
        <div className="text-center font-mono text-[11px] tracking-widest text-[#6E6B65] uppercase pt-4 border-t border-[#221F1C]/50">
          EL-DOCUMENTARY · JURNAL TRADING · DIPERBARUI SETIAP MINGGU
        </div>
      </footer>
    </div>
  );
}
