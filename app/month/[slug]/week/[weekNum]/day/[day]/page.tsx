import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTrades } from "@/lib/notion";

export const revalidate = 60;

const monthNames: Record<string, string> = {
  january: "Januari",
  february: "Februari",
  march: "Maret",
  april: "April",
  may: "Mei",
  june: "Juni",
  july: "Juli",
  august: "Agustus",
  september: "September",
  october: "Oktober",
  november: "November",
  december: "Desember",
};
const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default async function DayPage({ params }: { params: Promise<{ slug: string; weekNum: string; day: string }> }) {
  const { slug, weekNum, day } = await params;
  const [year, month] = slug.split("-");
  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[Object.keys(monthNames)[monthIndex]];

  const allTrades = await fetchTrades();
  const trades = allTrades.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === parseInt(year) && d.getMonth() === monthIndex && d.toISOString().split("T")[0] === day;
  });

  if (trades.length === 0) notFound();

  const trade = trades[0];
  const d = new Date(trade.date);
  const isWin = trade.result === "Win";
  const isLoss = trade.result === "Loss";

  const praPasar = trade.praPasar || '';
  const eksekusi = trade.eksekusi || '';

  return (
    <>
      {/* Beranda */}
      <div className="flex justify-end items-center py-3 px-6 border-b border-[#221F1C]">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 flex items-center gap-1.5"
        >
          <span>←</span> Beranda
        </Link>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Kembali ke minggu */}
        <div className="mb-6">
          <Link
            href={`/month/${slug}/week/${weekNum}`}
            className="inline-flex items-center gap-1 text-sm font-mono text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 uppercase tracking-wider"
          >
            <span>←</span> Kembali ke Minggu {weekNum}
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10">
          <div className="eyebrow water text-sm">
            {dayNames[d.getDay()].toUpperCase()} · {d.getDate()} {monthName} {year} · LONDON
          </div>
          <h1 className="font-['Big_Shoulders'] font-black text-[clamp(36px,5.5vw,60px)] leading-tight">
            {trade.instrument} {trade.direction} —
          </h1>
        </header>

        {/* Meta Info — lebih lebar ke kanan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-6 border-b border-[#221F1C]">
          <div>
            <div className="font-mono text-xs uppercase text-[#6E6B65] tracking-wider">Instrumen</div>
            <div className="text-lg font-medium text-[#E8E6E1]">{trade.instrument}</div>
          </div>
          <div>
            <div className="font-mono text-xs uppercase text-[#6E6B65] tracking-wider">Arah</div>
            <div className="text-lg font-medium text-[#E8E6E1]">{trade.direction}</div>
          </div>
          <div>
            <div className="font-mono text-xs uppercase text-[#6E6B65] tracking-wider">Trigger Entry</div>
            <div className="text-lg font-medium text-[#E8E6E1]">{trade.trigger || "—"}</div>
          </div>
          <div>
            <div className="font-mono text-xs uppercase text-[#6E6B65] tracking-wider">Hasil</div>
            <div className={`text-lg font-medium ${isWin ? "text-[#C49A3C]" : isLoss ? "text-[#8B3A1F]" : "text-[#E8E6E1]"}`}>
              {isWin ? `+${trade.r}R · Profit` : isLoss ? `−${trade.r}R · Rugi` : `${trade.r}R · Scratch`}
            </div>
          </div>
        </div>

        {/* ===== PRA-PASAR — spasi besar ===== */}
        <section className="mb-16">
          <div className="eyebrow water text-sm">BACAAN PRA-PASAR</div>
          <h2 className="font-['Big_Shoulders'] font-bold text-2xl mb-6">Sebelum sesi dimulai</h2>
          <div className="text-[#E8E6E1] text-base leading-relaxed max-w-4xl min-h-[120px]">
            {praPasar ? (
              <div className="whitespace-pre-wrap">{praPasar}</div>
            ) : (
              <p className="text-[#6E6B65] italic">Belum ada catatan pra-pasar.</p>
            )}
          </div>
        </section>

        {/* ===== EKSEKUSI — spasi besar ===== */}
        <section className="mb-16">
          <div className="eyebrow steel text-sm">APA YANG DILAKUKAN HARGA — EKSEKUSI</div>
          <h2 className="font-['Big_Shoulders'] font-bold text-2xl mb-6">Alasan Entry & Detail Eksekusi</h2>
          <div className="text-[#E8E6E1] text-base leading-relaxed max-w-4xl min-h-[120px]">
            {eksekusi ? (
              <div className="whitespace-pre-wrap">{eksekusi}</div>
            ) : (
              <p className="text-[#6E6B65] italic">Belum ada catatan eksekusi.</p>
            )}
          </div>
        </section>

        {/* ===== HASIL ===== */}
        <section className="pt-4 border-t border-[#221F1C]">
          <div className="eyebrow text-sm">HASIL</div>
          <h2 className="font-['Big_Shoulders'] font-bold text-2xl mb-6">Grade & hasil akhir</h2>

          <div className="stat-strip">
            <div className="stat">
              <div className="stat-label text-xs uppercase tracking-wider">Grade Setup</div>
              <div className="stat-value gold">{trade.grade}</div>
            </div>
            <div className="stat">
              <div className="stat-label text-xs uppercase tracking-wider">Hasil Akhir</div>
              <div className={`stat-value ${isWin ? "gold" : "rust"}`}>
                {isWin ? "Profit" : isLoss ? "Rugi" : "Scratch"}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label text-xs uppercase tracking-wider">Hasil R</div>
              <div className={`stat-value ${isWin ? "water" : "rust"}`}>
                {isWin ? "+" : ""}{trade.r}R
              </div>
            </div>
            <div className="stat">
              <div className="stat-label text-xs uppercase tracking-wider">Pelanggaran</div>
              <div className="stat-value">0</div>
            </div>
          </div>

          <div className="text-[#A6A39C] text-base max-w-3xl mt-6 leading-relaxed">
            <p>✏️ Kesimpulan jujur — kenapa grade ini, dan perbaikan untuk lain kali.</p>
          </div>
        </section>
      </div>
    </>
  );
}
