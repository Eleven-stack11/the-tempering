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

  // Ambil pra-pasar & eksekusi
  const praPasar = trade.praPasar || '';
  const eksekusi = trade.eksekusi || '';

  return (
    <>
      {/* Beranda */}
      <div className="flex justify-end items-center py-3 px-4 border-b border-[#221F1C] mb-4">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 flex items-center gap-1.5"
        >
          <span>←</span> Beranda
        </Link>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Kembali ke minggu */}
        <div className="mb-4">
          <Link
            href={`/month/${slug}/week/${weekNum}`}
            className="inline-flex items-center gap-1 text-sm font-mono text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 uppercase tracking-wider"
          >
            <span>←</span> Kembali ke Minggu {weekNum}
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="eyebrow water text-base md:text-lg">
            {dayNames[d.getDay()].toUpperCase()} · {d.getDate()} {monthName} {year} · LONDON
          </div>
          <h1 className="font-['Big_Shoulders'] font-black text-[clamp(36px,5.5vw,60px)] leading-tight">
            {trade.instrument} {trade.direction} —
          </h1>
        </header>

        {/* Meta */}
        <div className="day-meta flex flex-wrap gap-6 mb-8">
          <div className="day-meta-item font-mono text-xs uppercase text-[#6E6B65]">
            Instrumen
            <b className="block font-sans text-[#E8E6E1] text-base font-medium">{trade.instrument}</b>
          </div>
          <div className="day-meta-item font-mono text-xs uppercase text-[#6E6B65]">
            Arah
            <b className="block font-sans text-[#E8E6E1] text-base font-medium">{trade.direction}</b>
          </div>
          <div className="day-meta-item font-mono text-xs uppercase text-[#6E6B65]">
            Trigger Entry
            <b className="block font-sans text-[#E8E6E1] text-base font-medium">{trade.trigger || "—"}</b>
          </div>
          <div className={`day-meta-item font-mono text-xs uppercase text-[#6E6B65] ${isLoss ? "outcome-loss" : isWin ? "outcome-win" : ""}`}>
            Hasil
            <b className={`block font-sans text-base font-medium ${isWin ? "text-[#C49A3C]" : isLoss ? "text-[#8B3A1F]" : "text-[#E8E6E1]"}`}>
              {isWin ? `+${trade.r}R · Profit` : isLoss ? `−${trade.r}R · Rugi` : `${trade.r}R · Scratch`}
            </b>
          </div>
        </div>

        {/* ===== BACAAN PRA-PASAR ===== */}
        <section className="mb-8 border-b border-[#221F1C] pb-8">
          <div className="eyebrow water text-base md:text-lg">BACAAN PRA-PASAR</div>
          <h3 className="font-['Big_Shoulders'] font-bold text-2xl md:text-3xl mb-4">Sebelum sesi dimulai</h3>
          <div className="body-copy text-base md:text-lg max-w-3xl">
            {praPasar ? (
              <div className="whitespace-pre-wrap text-[#E8E6E1]">{praPasar}</div>
            ) : (
              <p className="text-[#6E6B65] italic">Belum ada catatan pra-pasar. Isi properti <code>Pra-pasar</code> di Notion.</p>
            )}
          </div>
          <div className="placeholder-note text-sm mt-4">
            ✏️ Untuk mengedit, isi properti <code>Pra-pasar</code> (Rich Text) di database Notion.
          </div>
        </section>

        {/* ===== EKSEKUSI / APA YANG DILAKUKAN HARGA ===== */}
        <section className="mb-8 border-b border-[#221F1C] pb-8">
          <div className="eyebrow steel text-base md:text-lg">APA YANG DILAKUKAN HARGA — EKSEKUSI</div>
          <h3 className="font-['Big_Shoulders'] font-bold text-2xl md:text-3xl mb-4">Alasan Entry & Detail Eksekusi</h3>
          <div className="body-copy text-base md:text-lg max-w-3xl">
            {eksekusi ? (
              <div className="whitespace-pre-wrap text-[#E8E6E1]">{eksekusi}</div>
            ) : (
              <p className="text-[#6E6B65] italic">Belum ada catatan eksekusi. Isi properti <code>Eksekusi</code> di Notion.</p>
            )}
          </div>
          <div className="placeholder-note text-sm mt-4">
            ✏️ Untuk mengedit, isi properti <code>Eksekusi</code> (Rich Text) di database Notion.
          </div>
        </section>

        {/* ===== BENAR / SALAH ===== */}
        <section className="mb-8 border-b border-[#221F1C] pb-8">
          <div className="eyebrow gold text-base md:text-lg">DI MANA BACAAN INI BENAR / SALAH</div>
          <h3 className="font-['Big_Shoulders'] font-bold text-2xl md:text-3xl mb-4">Pembagian yang jujur</h3>
          <div className="body-copy text-base md:text-lg max-w-3xl">
            <p><strong className="text-[#E8E6E1]">Benar:</strong> ✏️ Bagian mana dari bacaan/eksekusi yang benar.</p>
            <p><strong className="text-[#E8E6E1]">Salah:</strong> ✏️ Bagian mana yang meleset, sejujur mungkin.</p>
          </div>
          <div className="pull">
            <p className="text-lg md:text-xl">✏️ Satu kalimat kunci — pelajaran psikologis dari trade ini.</p>
          </div>
        </section>

        {/* ===== ADAPTASI ===== */}
        <section className="mb-8 border-b border-[#221F1C] pb-8">
          <div className="eyebrow water text-base md:text-lg">ADAPTASI</div>
          <h3 className="font-['Big_Shoulders'] font-bold text-2xl md:text-3xl mb-4">Apa yang berubah</h3>
          <div className="body-copy text-base md:text-lg max-w-3xl">
            <p>✏️ Apa yang diubah atau dilakukan berbeda karena trade ini.</p>
          </div>
        </section>

        {/* ===== REKAMAN SESI ===== */}
        <section className="mb-8 border-b border-[#221F1C] pb-8">
          <div className="eyebrow steel text-base md:text-lg">REKAMAN SESI</div>
          <h3 className="font-['Big_Shoulders'] font-bold text-2xl md:text-3xl mb-4">Rekaman layar — dari pra-pasar sampai exit</h3>
          <div className="video-slot max-w-3xl">
            <div className="play text-2xl">▶</div>
          </div>
          {trade.link && (
            <div className="video-caption text-sm mt-2">
              <a href={trade.link} target="_blank" rel="noopener noreferrer" className="text-[#C49A3C]">
                📹 Buka rekaman di Notion →
              </a>
            </div>
          )}
          <details className="transcript max-w-3xl mt-4">
            <summary className="text-sm md:text-base">Transkrip</summary>
            <div className="transcript-body text-sm md:text-base">✏️ Transkrip video di sini.</div>
          </details>
        </section>

        {/* ===== HASIL ===== */}
        <section>
          <div className="eyebrow text-base md:text-lg">HASIL</div>
          <h3 className="font-['Big_Shoulders'] font-bold text-2xl md:text-3xl mb-4">Grade & hasil akhir</h3>

          <div className="stat-strip">
            <div className="stat">
              <div className="stat-label text-sm md:text-base">Grade Setup</div>
              <div className="stat-value text-3xl md:text-5xl gold">{trade.grade}</div>
            </div>
            <div className="stat">
              <div className="stat-label text-sm md:text-base">Hasil Akhir</div>
              <div className={`stat-value text-3xl md:text-5xl ${isWin ? "gold" : "rust"}`}>
                {isWin ? "Profit" : isLoss ? "Rugi" : "Scratch"}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label text-sm md:text-base">Hasil R</div>
              <div className={`stat-value text-3xl md:text-5xl ${isWin ? "water" : "rust"}`}>
                {isWin ? "+" : ""}{trade.r}R
              </div>
            </div>
            <div className="stat">
              <div className="stat-label text-sm md:text-base">Pelanggaran Aturan</div>
              <div className="stat-value text-3xl md:text-5xl">0</div>
            </div>
          </div>

          <div className="body-copy text-base md:text-lg max-w-3xl mt-6">
            <p>✏️ Kesimpulan jujur soal grade ini — kenapa dapat grade itu, dan apa perbaikan konkret untuk lain kali.</p>
          </div>
        </section>
      </div>
    </>
  );
}
