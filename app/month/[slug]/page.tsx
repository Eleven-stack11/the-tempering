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
    return !isNaN(d.getTime()) && d.getFullYear() === yearNum && d.getMonth() === monthIndex && t.isTrade === true;
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
    <>
      <header className="mb-8">
        <div className="eyebrow steel">BULAN {String(monthIndex + 1).padStart(2, "0")} · {year}</div>
        <h1 className="font-['Big_Shoulders'] font-black text-[clamp(44px,7vw,80px)] leading-tight">
          {monthName}
        </h1>
        <p className="text-[#A6A39C] text-lg">
          {totalSessions} trade tercatat · Net R {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R
        </p>
      </header>

      <section className="section-spacing">
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

      <div className="blade-rule on-scroll" style={{ marginBottom: 40 }}></div>

      <section>
        <div className="sec-head">
          <h2>Minggu-Minggu</h2>
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
            const localWeekNumber = idx + 1;
            const linkHref = `/month/${slug}/week/${week.weekNumber}`;

            return (
              <Link key={week.weekNumber} href={linkHref} className={`rail-row ${hasTrade ? "linked" : "locked"}`}>
                <div className="rail-day">
                  {monthLabel}
                  <b>{startDay}–{endDay}</b>
                </div>
                <div className="rail-body">
                  <h4>Minggu {localWeekNumber}{!hasTrade && " — belum ditempa"}</h4>
                  <p>{dateRange} · {weekTrades.length} trade</p>
                </div>
                {hasTrade ? (
                  <>
                    <div className="rail-tag">{weekTrades.length} TRADE</div>
                    <div className={`rail-tag ${weekR >= 0 ? "text-[#2E5695]" : "text-[#8B3A1F]"}`}>
                      {weekR >= 0 ? "+" : ""}{weekR.toFixed(1)}R
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

      <div className="ink-divider"></div>

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
    </>
  );
}
