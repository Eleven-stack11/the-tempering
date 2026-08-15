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

// Helper: ekstrak ID YouTube
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

// Helper: timeframe terbawah
function getLowestPassedTimeframe(trade: any): string {
  const filters = [
    { key: 'm3Filter', label: '3M' },
    { key: 'm5Filter', label: '5M' },
    { key: 'm15Filter', label: '15M' },
    { key: 'h1Filter', label: '1H' },
    { key: 'h4Filter', label: '4H' },
    { key: 'dailyFilter', label: 'Daily' },
  ];
  for (const f of filters) {
    if (trade[f.key] === 'Pass') {
      return f.label;
    }
  }
  return '—';
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

  const praPasar = trade.praPasar || '';
  const eksekusi = trade.eksekusi || '';
  const session = trade.session || 'LONDON';
  const time = trade.time || '';
  const youtubeLink = trade.link || '';

  const triggerDisplay = getLowestPassedTimeframe(trade);
  const youtubeId = getYoutubeId(youtubeLink);

  let sessionDisplay = session;
  if (time && time !== session) {
    sessionDisplay = `${session} · ${time}`;
  }

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

        {/* HEADER */}
        <header className="mb-6">
          <div className="eyebrow water text-sm tracking-[0.2em]">
            {dayNames[d.getDay()].toUpperCase()} · {d.getDate()} {monthName} {year} · {sessionDisplay}
          </div>
        </header>

        {/* DATA TABLE */}
        <div className="grid grid-cols-4 gap-6 mb-12 mt-16 p-8 md:p-10 bg-[#1A1918] border border-[#2C2A27]">
          <div className="text-center">
            <div className="font-mono text-sm uppercase text-[#6E6B65] tracking-wider mb-3">Instrumen</div>
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#E8E6E1] tracking-wide">
              {trade.instrument}
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-sm uppercase text-[#6E6B65] tracking-wider mb-3">Arah</div>
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#E8E6E1] tracking-wide">
              {trade.direction}
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-sm uppercase text-[#6E6B65] tracking-wider mb-3">Trigger Entry</div>
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#E8E6E1] tracking-wide">
              {triggerDisplay}
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-sm uppercase text-[#6E6B65] tracking-wider mb-3">Hasil</div>
            <div className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide ${
              isWin ? "text-[#C49A3C]" : isLoss ? "text-[#8B3A1F]" : "text-[#E8E6E1]"
            }`}>
              {isWin ? `+${trade.r}R` : isLoss ? `−${trade.r}R` : `${trade.r}R`}
            </div>
          </div>
        </div>

        {/* ===== EMBED YOUTUBE — UKURAN KECIL, TIDAK MELEBAR ===== */}
        {youtubeId && (
          <div className="mx-auto max-w-xs mb-10 pb-4 border-b border-[#221F1C]">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Rekaman sesi trading"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="text-sm text-[#A6A39C] mt-2 text-center">
              📹 Rekaman sesi — klik play untuk menonton
            </div>
          </div>
        )}

        {/* ===== PRA-PASAR ===== */}
        <section className="mb-16">
          <div className="eyebrow water text-sm">BACAAN PRA-PASAR</div>
          <h2 className="font-['Big_Shoulders'] font-bold text-2xl mb-6">Sebelum sesi dimulai</h2>
          <div className="text-[#E8E6E1] text-base leading-relaxed max-w-4xl min-h-[100px]">
            {praPasar ? (
              <div className="whitespace-pre-wrap">{praPasar}</div>
            ) : (
              <p className="text-[#6E6B65] italic">Belum ada catatan pra-pasar.</p>
            )}
          </div>
        </section>

        {/* ===== EKSEKUSI ===== */}
        <section className="mb-16">
          <div className="eyebrow steel text-sm">APA YANG DILAKUKAN HARGA — EKSEKUSI</div>
          <h2 className="font-['Big_Shoulders'] font-bold text-2xl mb-6">Alasan Entry & Detail Eksekusi</h2>
          <div className="text-[#E8E6E1] text-base leading-relaxed max-w-4xl min-h-[100px]">
            {eksekusi ? (
              <div className="whitespace-pre-wrap">{eksekusi}</div>
            ) : (
              <p className="text-[#6E6B65] italic">Belum ada catatan eksekusi.</p>
            )}
          </div>
        </section>

        {/* ===== HASIL (BAGIAN BAWAH) ===== */}
        <section className="pt-4 border-t border-[#221F1C]">
          <div className="eyebrow text-sm">HASIL</div>
          <h2 className="font-['Big_Shoulders'] font-bold text-2xl mb-6">Grade & hasil akhir</h2>

          <div className="stat-strip">
            <div className="stat">
              <div className="stat-label text-xs uppercase tracking-wider">Grade Setup</div>
              <div className="stat-value text-3xl md:text-5xl gold">{trade.grade}</div>
            </div>
            <div className="stat">
              <div className="stat-label text-xs uppercase tracking-wider">Hasil Akhir</div>
              <div className={`stat-value text-3xl md:text-5xl ${isWin ? "gold" : "rust"}`}>
                {isWin ? "Profit" : isLoss ? "Rugi" : "Scratch"}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label text-xs uppercase tracking-wider">Hasil R</div>
              <div className={`stat-value text-3xl md:text-5xl ${isWin ? "water" : "rust"}`}>
                {isWin ? "+" : ""}{trade.r}R
              </div>
            </div>
            <div className="stat">
              <div className="stat-label text-xs uppercase tracking-wider">Pelanggaran</div>
              <div className="stat-value text-3xl md:text-5xl">0</div>
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
