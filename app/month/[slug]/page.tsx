import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTrades, getWeeksOfMonth } from "@/lib/notion";

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

export default async function MonthPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const parts = slug.split("-");
  if (parts.length !== 2) {
    return <div className="p-8 text-[#A6A39C]">Format bulan tidak valid.</div>;
  }
  const [year, month] = parts;
  const yearNum = parseInt(year);
  const monthIndex = parseInt(month) - 1;
  if (isNaN(yearNum) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return <div className="p-8 text-[#A6A39C]">Bulan tidak valid.</div>;
  }

  const monthKey = Object.keys(monthNames)[monthIndex];
  const monthName = monthNames[monthKey];

  const allTrades = await fetchTrades();

  const trades = allTrades.filter((t) => {
    const d = new Date(t.date);
    return !isNaN(d.getTime()) && d.getFullYear() === yearNum && d.getMonth() === monthIndex;
  });

  if (trades.length === 0) notFound();

  const weeks = getWeeksOfMonth(yearNum, monthIndex);

  const tradeGroups: Record<number, any[]> = {};
  for (const t of trades) {
    const d = new Date(t.date);
    const monday = new Date(d);
    while (monday.getDay() !== 1) {
      monday.setDate(monday.getDate() - 1);
    }
    for (const w of weeks) {
      if (w.start.toISOString().split("T")[0] === monday.toISOString().split("T")[0]) {
        if (!tradeGroups[w.weekNumber]) tradeGroups[w.weekNumber] = [];
        tradeGroups[w.weekNumber].push(t);
        break;
      }
    }
  }

  const totalSessions = trades.length;
  const enteredCount = trades.filter((t) => t.status === "Entered").length;
  const missedCount = trades.filter((t) => t.status === "Missed").length;
  const totalConsidered = enteredCount + missedCount;
  const executionRate = totalConsidered > 0 ? Math.round((enteredCount / totalConsidered) * 100) : 0;

  const violations = trades.filter((t) => 
    t.notes?.toLowerCase().includes("pelanggaran")
  ).length;

  const netR = trades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);

  let monthlyNote = '';
  for (const t of trades) {
    if (t.monthlyNote && t.monthlyNote.trim().length > 0) {
      monthlyNote = t.monthlyNote;
      break;
    }
  }

  const defaultDesc = "Bacaan hari Minggu, lima sesi kontak dengan pasar, dan pertanggungjawaban jujur hari Sabtu.";
  const description = monthlyNote || defaultDesc;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Tombol Beranda (kanan atas) */}
      <div className="flex justify-end items-center mb-4">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 flex items-center gap-1.5"
        >
          <span>←</span> Beranda
        </Link>
      </div>

      {/* Tombol kembali ke 2026 */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-mono text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 uppercase tracking-wider"
        >
          <span>←</span> Kembali ke 2026
        </Link>
      </div>

      {/* Header */}
      <header className="mb-8">
        <div className="eyebrow steel">BULAN {String(monthIndex + 1).padStart(2, "0")} · {year}</div>
        <h1 className="font-['Big_Shoulders'] font-black text-[clamp(44px,7vw,80px)] leading-tight">
          {monthName}
        </h1>
        <p className="text-[#A6A39C] text-lg">
          {totalSessions} trade tercatat · Net R {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R
        </p>
      </header>

      {/* Stat Strip */}
      <section className="mb-8">
        <div className="stat-strip">
          <div className="stat">
            <div className="stat-label">Sesi Tercatat</div>
            <div className="stat-value">{totalSessions}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Diambil vs Miss</div>
            <div className="stat-value text-[#2E5695]">
              {enteredCount} / {missedCount}
            </div>
            <div className="text-xs text-[#6E6B65] font-mono mt-1">
              {executionRate}% diambil
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Pelanggaran</div>
            <div className="stat-value rust">{violations}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Net R</div>
            <div className={`stat-value ${netR >= 0 ? "water" : "rust"}`}>
              {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R
            </div>
          </div>
        </div>
      </section>

      {/* Blade Rule */}
      <div className="blade-rule on-scroll" style={{ marginBottom: 40 }}></div>

      {/* ===== MINGGU-MINGGU (FONT LEBIH BESAR) ===== */}
      <section>
        <div className="sec-head">
          <h2 className="text-3xl md:text-4xl">Minggu-Minggu</h2>
          <p className="text-base md:text-lg text-[#A6A39C]">{description}</p>
        </div>

        <div className="rail text-base md:text-lg">
          {weeks.map((week, idx) => {
            const weekTrades = tradeGroups[week.weekNumber] || [];
            const weekR = weekTrades.reduce(
              (sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0),
              0
            );
            const startDay = week.start.getDate();
            const endDay = week.end.getDate();
            const monthLabel = monthName.slice(0, 3).toUpperCase();
            const dateRange = `${startDay}–${endDay} ${monthName} ${year}`;

            const hasTrade = weekTrades.length > 0;
            const linkHref = hasTrade ? `/month/${slug}/week/${week.weekNumber}` : "#";
            const localWeekNumber = idx + 1;

            return (
              <Link
                key={week.weekNumber}
                href={linkHref}
                className={`rail-row ${hasTrade ? "linked" : "locked"} py-4 md:py-5 px-4 md:px-6`}
              >
                <div className="rail-day text-base md:text-lg">
                  {monthLabel}
                  <b className="text-2xl md:text-3xl">
                    {startDay}–{endDay}
                  </b>
                </div>
                <div className="rail-body">
                  <h4 className="text-lg md:text-xl font-medium">Minggu {localWeekNumber}</h4>
                  <p className="text-base md:text-lg text-[#A6A39C]">
                    {dateRange} · {weekTrades.length} trade
                  </p>
                </div>
                {hasTrade ? (
                  <>
                    {/* === PERBESAR FONT DI SINI === */}
                    <div className="rail-tag text-base md:text-xl font-bold tracking-wider">
                      {weekTrades.length} TRADE
                    </div>
                    <div className={`rail-tag text-base md:text-xl font-bold tracking-wider ${weekR >= 0 ? "text-[#2E5695]" : "text-[#8B3A1F]"}`}>
                      {weekR >= 0 ? "+" : ""}
                      {weekR.toFixed(1)}R
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rail-tag"></div>
                    <div className="rail-tag"></div>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="ink-divider"></div>

      {/* Monthly Note */}
      <section>
        <div className="sec-head">
          <h2 className="text-3xl md:text-4xl">Catatan Bulanan</h2>
        </div>
        <div className="max-w-2xl text-[#A6A39C] text-base md:text-lg leading-relaxed mb-12">
          <p>{monthlyNote || "✏️ Tidak ada catatan bulanan. Isi properti `Monthly Note` di Notion."}</p>
          <div className="placeholder-note mt-3 text-sm">
            ✏️ Untuk mengubah catatan, isi properti <code>Monthly Note</code> (Rich Text) di database Notion.
          </div>
        </div>
      </section>
    </div>
  );
}
