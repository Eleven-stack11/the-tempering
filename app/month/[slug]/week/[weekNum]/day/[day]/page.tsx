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

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/embed\/)([\w-]+)/,
    /(?:youtube\.com\/v\/)([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

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
  const youtubeId = getYoutubeId(trade.link);

  return (
    <>
      {/* DAY HERO — tanpa tombol "Kembali ke Minggu" */}
      <div className="day-hero">
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

      {/* YouTube Embed (jika ada) */}
      {youtubeId && (
        <div className="mx-auto max-w-xs my-6">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
          <div className="text-sm text-[#A6A39C] mt-2 text-center">📹 Rekaman sesi — klik play untuk menonton</div>
        </div>
      )}

      {/* Pra-pasar */}
      <section className="section-spacing border-b border-[#221F1C] pb-8">
        <div className="eyebrow water text-sm">BACAAN PRA-PASAR</div>
        <div className="text-[#E8E6E1] text-base leading-relaxed max-w-4xl min-h-[80px] mt-2">
          {trade.praPasar ? (
            <div className="whitespace-pre-wrap">{trade.praPasar}</div>
          ) : (
            <p className="text-[#6E6B65] italic">Belum ada catatan pra-pasar.</p>
          )}
        </div>
      </section>

      {/* Eksekusi */}
      <section className="section-spacing border-b border-[#221F1C] pb-8">
        <div className="eyebrow steel text-sm">APA YANG DILAKUKAN HARGA — EKSEKUSI</div>
        <div className="text-[#E8E6E1] text-base leading-relaxed max-w-4xl min-h-[80px] mt-2">
          {trade.eksekusi ? (
            <div className="whitespace-pre-wrap">{trade.eksekusi}</div>
          ) : (
            <p className="text-[#6E6B65] italic">Belum ada catatan eksekusi.</p>
          )}
        </div>
      </section>

      {/* Hasil */}
      <section className="section-spacing">
        <div className="eyebrow text-sm">HASIL</div>
        <h2 className="font-['Big_Shoulders'] font-bold text-2xl mb-6">Grade & hasil akhir</h2>

        <div className="stat-strip">
          <div className="stat">
            <div className="stat-label">Grade Setup</div>
            <div className="stat-value gold">{trade.grade}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Hasil Akhir</div>
            <div className={`stat-value ${isWin ? "gold" : "rust"}`}>
              {isWin ? "Profit" : isLoss ? "Rugi" : "Scratch"}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Hasil R</div>
            <div className={`stat-value ${isWin ? "water" : "rust"}`}>
              {isWin ? "+" : ""}{trade.r}R
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Pelanggaran</div>
            <div className="stat-value">0</div>
          </div>
        </div>

      </section>
    </>
  );
}
