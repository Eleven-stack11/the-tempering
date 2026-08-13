import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTrades, getWeekNumber } from "@/lib/notion";

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
  const [year, month] = slug.split("-");
  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[Object.keys(monthNames)[monthIndex]];

  const allTrades = await fetchTrades();
  const trades = allTrades.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === parseInt(year) && d.getMonth() === monthIndex;
  });

  if (trades.length === 0) notFound();

  // Group by week
  const weekMap: Record<number, any[]> = {};
  for (const t of trades) {
    const d = new Date(t.date);
    const w = getWeekNumber(d);
    if (!weekMap[w]) weekMap[w] = [];
    weekMap[w].push(t);
  }
  const weekKeys = Object.keys(weekMap).map(Number).sort((a, b) => a - b);

  const netR = trades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);
  const totalSessions = trades.length;
  const setupA = trades.filter((t) => t.grade === "A").length;
  const violations = trades.filter((t) => t.notes?.toLowerCase().includes("pelanggaran")).length;

  return (
    <>
      <nav className="site-nav">
        <div className="wrap">
          <div className="brand"><span className="mark"></span> THE TEMPERING</div>
          <div className="crumbs">
            <Link href="/">2026</Link>
            <span className="sep">/</span>
            <span className="here">{monthName}</span>
          </div>
        </div>
      </nav>

      <header className="hero" style={{ padding: "64px 0 48px" }}>
        <div className="wrap">
          <div className="eyebrow steel">BULAN {String(monthIndex + 1).padStart(2, "0")} · {year}</div>
          <h1 style={{ fontSize: "clamp(44px, 7vw, 80px)" }}>{monthName}</h1>
          <p className="lede">
            {trades.length} trade tercatat · Net R {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R
          </p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="stat-strip">
            <div className="stat"><div className="stat-label">Sesi Tercatat</div><div className="stat-value">{totalSessions}</div></div>
            <div className="stat"><div className="stat-label">Setup A+ / A</div><div className="stat-value gold">{setupA}</div></div>
            <div className="stat"><div className="stat-label">Pelanggaran Aturan Tertangkap</div><div className="stat-value rust">{violations}</div></div>
            <div className="stat"><div className="stat-label">Net R</div><div className={`stat-value ${netR >= 0 ? "water" : "rust"}`}>{netR >= 0 ? "+" : ""}{netR.toFixed(1)}R</div></div>
          </div>
        </div>
      </section>

      <div className="blade-rule on-scroll wrap" style={{ maxWidth: 1080, marginTop: 20 }}></div>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <h2>Minggu-Minggu</h2>
            <p>Bacaan hari Minggu, lima sesi kontak dengan pasar, dan pertanggungjawaban jujur hari Sabtu.</p>
          </div>

          <div className="rail">
            {weekKeys.map((weekNum) => {
              const weekTrades = weekMap[weekNum];
              const first = new Date(weekTrades[0].date);
              const last = new Date(weekTrades[weekTrades.length - 1].date);
              const weekR = weekTrades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);
              const monthLabel = monthName.slice(0, 3).toUpperCase();

              return (
                <Link key={weekNum} href={`/month/${slug}/week/${weekNum}`} className="rail-row linked">
                  <div className="rail-day">
                    {monthLabel}<b>{first.getDate()}–{last.getDate()}</b>
                  </div>
                  <div className="rail-body">
                    <h4>Minggu {weekNum}</h4>
                    <p>{weekTrades.length} trade</p>
                  </div>
                  <div className="rail-tag">{weekTrades.length} TRADE</div>
                  <div className={`rail-tag ${weekR >= 0 ? "text-[#2E5695]" : "text-[#8B3A1F]"}`}>
                    {weekR >= 0 ? "+" : ""}{weekR.toFixed(1)}R
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="ink-divider"></div>

      <section>
        <div className="wrap">
          <div className="sec-head"><h2>Catatan Bulanan</h2></div>
          <div style={{ maxWidth: 640, color: "var(--text-muted)", fontSize: 16, lineHeight: 1.85, marginBottom: 60 }}>
            <p>✏️ Tuliskan alur cerita bulan ini di sini — atau tambahkan sebagai properti di Notion.</p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap">
          <div className="blade-rule static" style={{ marginBottom: 36 }}></div>
          <div className="foot-meta">THE TEMPERING · {monthName} {year} · <Link href="/" style={{ color: "var(--gold)" }}>↑ KEMBALI KE 2026</Link></div>
        </div>
      </footer>
    </>
  );
}
