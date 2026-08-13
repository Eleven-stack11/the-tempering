import Link from "next/link";
import { fetchTrades } from "@/lib/notion";

export const revalidate = 60;

export default async function HomePage() {
  const trades = await fetchTrades();

  // Group by month
  const monthMap: Record<string, any[]> = {};
  for (const t of trades) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(t);
  }

  const monthKeys = Object.keys(monthMap).sort().reverse();
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

  const netR = trades.reduce(
    (sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0),
    0
  );

  return (
    <>
      {/* Nav */}
      <nav className="border-b border-[#221F1C] py-5 px-6">
        <div className="max-w-[1080px] mx-auto flex justify-between items-center">
          <div className="font-mono text-xs text-[#A6A39C] uppercase flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 bg-[#C49A3C] rotate-45 inline-block"></span>
            THE TEMPERING
          </div>
          <div className="font-mono text-xs text-[#6E6B65]">
            <span className="text-[#E8E6E1]">2026</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-20 px-6">
        <div className="max-w-[1080px] mx-auto">
          <div className="font-mono text-xs text-[#C49A3C] uppercase tracking-[0.18em] flex items-center gap-2.5 mb-4">
            <span className="w-[22px] h-px bg-[#C49A3C]"></span>
            SEBUAH CATATAN, BUKAN SEKADAR SOROTAN
          </div>
          <h1 className="font-['Big_Shoulders'] font-black text-[clamp(48px,8vw,96px)] leading-[0.92] mb-5">
            The <em className="text-[#2E5695] not-italic">Tempering</em>
          </h1>
          <p className="text-[#A6A39C] text-lg max-w-[560px] leading-relaxed font-light">
            Bongkahan besi tidak berubah jadi pedang secara kebetulan. Ia masuk ke dalam api,
            ditempa, didinginkan, lalu dimasukkan lagi.{" "}
            <strong className="text-[#E8E6E1] font-medium">
              Inilah proses itu, dituliskan
            </strong>{" "}
            — pembacaan pasar setiap minggu, di mana bacaan itu keliru, dan apa yang berubah
            sesudahnya.
          </p>
        </div>
      </header>

      {/* Blade rule */}
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[#56534E] to-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C49A3C] to-transparent opacity-55"></div>
        </div>
      </div>

      {/* Stats */}
      <section className="px-6 py-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#221F1C] border border-[#221F1C]">
            <div className="bg-[#1A1918] p-5">
              <div className="font-mono text-xs text-[#6E6B65] uppercase tracking-[0.1em] mb-2.5">
                Sesi Tercatat
              </div>
              <div className="font-['Big_Shoulders'] text-3xl font-extrabold">
                {trades.length}
              </div>
            </div>
            <div className="bg-[#1A1918] p-5">
              <div className="font-mono text-xs text-[#6E6B65] uppercase tracking-[0.1em] mb-2.5">
                Setup A+ / A
              </div>
              <div className="font-['Big_Shoulders'] text-3xl font-extrabold text-[#C49A3C]">
                {trades.filter((t) => t.grade === "A").length}
              </div>
            </div>
            <div className="bg-[#1A1918] p-5">
              <div className="font-mono text-xs text-[#6E6B65] uppercase tracking-[0.1em] mb-2.5">
                Pelanggaran
              </div>
              <div className="font-['Big_Shoulders'] text-3xl font-extrabold text-[#8B3A1F]">
                {trades.filter((t) => t.notes?.includes("pelanggaran")).length}
              </div>
            </div>
            <div className="bg-[#1A1918] p-5">
              <div className="font-mono text-xs text-[#6E6B65] uppercase tracking-[0.1em] mb-2.5">
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
        </div>
      </section>

      {/* Months grid */}
      <section className="px-6">
        <div className="max-w-[1080px] mx-auto">
          <div className="py-14">
            <h2 className="font-['Big_Shoulders'] font-extrabold text-[clamp(28px,4vw,40px)]">
              2026
            </h2>
            <p className="text-[#A6A39C] text-sm max-w-[520px]">
              Setiap bulan menyimpan minggu-minggunya. Setiap minggu menyimpan hari-harinya.
              Tidak ada yang dilewatkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#221F1C] border border-[#221F1C]">
            {monthKeys.map((key) => {
              const [year, month] = key.split("-");
              const monthName = monthNames[month] || month;
              const monthTrades = monthMap[key];
              return (
                <Link
                  key={key}
                  href={`/month/${year}-${month}`}
                  className="bg-[#1A1918] p-7 hover:bg-[#201F1C] transition-colors group"
                >
                  <div className="font-mono text-xs text-[#6E6B65] uppercase flex justify-between">
                    <span>BULAN {month}</span>
                    <span className="text-[#C49A3C] opacity-0 group-hover:opacity-100 transition">
                      →
                    </span>
                  </div>
                  <h3 className="font-['Big_Shoulders'] font-bold text-2xl text-[#E8E6E1] my-3">
                    {monthName}
                  </h3>
                  <p className="text-[#A6A39C] text-sm">{monthTrades.length} trade tercatat</p>
                  <div className="font-mono text-xs text-[#6E6B65] border-t border-[#221F1C] pt-3.5 mt-4 flex gap-4">
                    <span>
                      <b className="text-[#E8E6E1] font-medium">{monthTrades.length}</b> trade
                    </span>
                    <span>
                      <b className="text-[#E8E6E1] font-medium">NQ / ES</b>
                    </span>
                  </div>
                </Link>
              );
            })}
            <div className="bg-[#1A1918] p-7 opacity-45 cursor-default">
              <div className="font-mono text-xs text-[#6E6B65] uppercase flex justify-between">
                <span>BULAN 09</span>
                <span className="text-[#6E6B65]">🔒</span>
              </div>
              <h3 className="font-['Big_Shoulders'] font-bold text-2xl text-[#6E6B65] my-3">
                September
              </h3>
              <p className="text-[#A6A39C] text-sm">Belum ditempa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 mt-10">
        <div className="max-w-[1080px] mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-[#56534E] to-transparent mb-9"></div>
          <div className="font-['Big_Shoulders'] font-semibold text-xl text-[#A6A39C] max-w-[480px] leading-relaxed mb-6">
            "Pedang tidak mengingat dulunya ia besi.<br />Catatan ini yang mengingatnya."
          </div>
          <div className="font-mono text-xs text-[#6E6B65]">
            THE TEMPERING · JURNAL TRADING · DIPERBARUI DARI NOTION
          </div>
        </div>
      </footer>
    </>
  );
}
