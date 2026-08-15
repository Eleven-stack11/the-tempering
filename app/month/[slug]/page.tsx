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

  // Validasi slug
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

  // Filter trades bulan ini
  const trades = allTrades.filter((t) => {
    const d = new Date(t.date);
    return !isNaN(d.getTime()) && d.getFullYear() === yearNum && d.getMonth() === monthIndex;
  });

  if (trades.length === 0) notFound();

  // Dapatkan minggu-minggu
  const weeks = getWeeksOfMonth(yearNum, monthIndex);

  // Kelompokkan trade per minggu
  const tradeGroups: Record<number, any[]> = {};
  for (const t of trades) {
    const d = new Date(t.date);
    // Cari Senin minggu ini
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

  // Statistik
  const totalSessions = trades.length;
  const enteredCount = trades.filter((t) => t.status === "Entered").length;
  const missedCount = trades.filter((t) => t.status === "Missed").length;
  const studyCount = trades.filter((t) => t.status === "Study Case").length;
  const totalConsidered = enteredCount + missedCount;
  const executionRate = totalConsidered > 0 ? Math.round((enteredCount / totalConsidered) * 100) : 0;

  const netR = trades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);

  // --- Ambil Monthly Note dari trade pertama yang memiliki isi ---
  let monthlyNote = '';
  for (const t of trades) {
    if (t.notes && t.notes.trim().length > 0) {
      monthlyNote = t.notes;
      break;
    }
  }
  // Jika tidak ada, gunakan default
  const defaultDesc = "Bacaan hari Minggu, lima sesi kontak dengan pasar, dan pertanggungjawaban jujur hari Sabtu.";
  const description = monthlyNote || defaultDesc;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Tombol kembali ke homepage */}
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
            <div className="stat-label">Study Case</div>
            <div className="stat-value text-[#C49A3C]">{studyCount}</div>
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

      {/* Weeks List */}
      <section>
        <div className="sec-head">
          <h2>Monthly Note</h2>
          {/* Deskripsi dinamis dari Monthly Note */}
          <p>{description}</p>
        </div>

        <div className="rail">
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
                className={`rail-row ${hasTrade ? "linked" : "locked"}`}
              >
                <div className="rail-day">
                  {monthLabel}
                  <b>
                    {startDay}–{endDay}
                  </b>
                </div>
                <div className="rail-body">
                  <h4>Minggu {localWeekNumber}</h4>
                  <p>
                    {dateRange} · {weekTrades.length} trade
                  </p>
                </div>
                {hasTrade ? (
                  <>
                    <div className="rail-tag">{weekTrades.length} TRADE</div>
                    <div className={`rail-tag ${weekR >= 0 ? "text-[#2E5695]" : "text-[#8B3A1F]"}`}>
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

      {/* Monthly Note (di sini juga bisa ditampilkan, tapi kita sudah pakai di atas) */}
      <section>
        <div className="sec-head">
          <h2>Catatan Bulanan</h2>
        </div>
        <div className="max-w-2xl text-[#A6A39C] text-base leading-relaxed mb-12">
          <p>{monthlyNote || "✏️ Tidak ada catatan bulanan. Isi properti `Monthly Note` di Notion."}</p>
          <div className="placeholder-note mt-3">
            ✏️ Untuk mengubah catatan, isi properti <code>Monthly Note</code> (Rich Text) di database Notion.
          </div>
        </div>
      </section>
    </div>
  );
}
