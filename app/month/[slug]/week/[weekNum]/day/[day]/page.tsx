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

  const sessionDisplay = trade.session || 'LONDON';
  const triggerDisplay = trade.trigger || '—';

  return (
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

      {/* DAY HERO */}
      <div className="day-hero-new">
        <div className="day-hero-date">
          {dayNames[d.getDay()].toUpperCase()} · {d.getDate()} {monthName} {year} · {sessionDisplay}
        </div>
        <h1 className="day-hero-title">
          {trade.instrument} <span className="direction">{trade.direction}</span><br />
          {isWin ? <span className="result-win">+{trade.r}R</span> : isLoss ? <span className="result-loss">−{trade.r}R</span> : `${trade.r}R`}
        </h1>
        <div className="day-meta-table">
          <div className="day-meta-cell">
            <div className="label">Instrumen</div>
            <div className="val">{trade.instrument}</div>
          </div>
          <div className="day-meta-cell">
            <div className="label">Arah</div>
            <div className="val">{trade.direction}</div>
          </div>
          <div className="day-meta-cell">
            <div className="label">Trigger Entry</div>
            <div className="val">{triggerDisplay}</div>
          </div>
          <div className="day-meta-cell">
            <div className="label">Hasil</div>
            <div className={`val ${isWin ? 'win' : isLoss ? 'loss' : ''}`}>
              {isWin ? `+${trade.r}R` : isLoss ? `−${trade.r}R` : `${trade.r}R`}
            </div>
          </div>
        </div>
      </div>

      {/* Pra-pasar */}
      <section className="mt-8 mb-16">
        <div className="eyebrow water text-sm">BACAAN PRA-PASAR</div>
        <div className="text-[#E8E6E1] text-base leading-relaxed max-w-4xl min-h-[100px]">
          {trade.praPasar ? <div className="whitespace-pre-wrap">{trade.praPasar}</div> : <p className="text-[#6E6B65] italic">Belum ada catatan pra-pasar.</p>}
        </div>
      </section>

      {/* Eksekusi */}
      <section className="mb-16">
        <div className="eyebrow steel text-sm">APA YANG DILAKUKAN HARGA — EKSEKUSI</div>
        <div className="text-[#E8E6E1] text-base leading-relaxed max-w-4xl min-h-[100px]">
          {trade.eksekusi ? <div className="whitespace-pre-wrap">{trade.eksekusi}</div> : <p className="text-[#6E6B65] italic">Belum ada catatan eksekusi.</p>}
        </div>
      </section>

      {/* Hasil */}
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
  );
}
