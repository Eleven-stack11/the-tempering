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

// ---------- CATATAN BULANAN (EDIT DI SINI) ----------
const MONTHLY_NOTES: Record<string, string> = {
  june: "⚠️ Perhatian: Liburan musim panas di Eropa/US — volume rendah, pergerakan liar. Kurangi size.",
  july: "🔥 Bulan dengan pelanggaran limit sesi. Harus lebih disiplin.",
  august: "🌊 Bulan range. Fokus pada konfirmasi BMS sebelum entry.",
};
// ----------------------------------------------------

export default async function MonthPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [year, month] = slug.split("-");
  const yearNum = parseInt(year);
  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[Object.keys(monthNames)[monthIndex]];

  const allTrades = await fetchTrades();
  const trades = allTrades.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === yearNum && d.getMonth() === monthIndex;
  });

  if (trades.length === 0) notFound();

  // Dapatkan minggu-minggu dalam bulan ini
  const weeks = getWeeksOfMonth(yearNum, monthIndex);

  // Jika weeks kosong (misal karena bug), beri fallback
  if (weeks.length === 0) {
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
        <div className="wrap" style={{ padding: "40px 28px" }}>
          <h2>Error: Tidak ada minggu yang ditemukan untuk bulan ini.</h2>
          <p>Periksa fungsi getWeeksOfMonth di lib/notion.ts</p>
        </div>
      </>
    );
  }

  // Group trades berdasarkan minggu (menggunakan tanggal Monday)
  const tradeGroups: Record<number, any[]> = {};
  for (const t of trades) {
    const d = new Date(t.date);
    // Cari Senin minggu ini
    const monday = new Date(d);
    while (monday.getDay() !== 1) {
      monday.setDate(monday.getDate() - 1);
    }
    // Cari minggu yang sesuai di daftar weeks
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
  const setupA = trades.filter((t) => t.grade === "A").length;
  const violations = trades.filter((t) => t.notes?.toLowerCase().includes("pelanggaran")).length;
  const netR = trades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);

  const monthKey = Object.keys(monthNames)[monthIndex];
  const monthlyNote = MONTHLY_NOTES[monthKey] || "✏️ Tulis catatan bulanan di sini.";

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
            {weeks.map((week) => {
              const weekTrades = tradeGroups[week.weekNumber] || [];
              const weekR = weekTrades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);
              const startDay = week.start.getDate();
              const endDay = week.end.getDate();
              const monthLabel = monthName.slice(0, 3).toUpperCase();
              const dateRange = `${startDay}–${endDay} ${monthName} ${year}`;

              const hasTrade = weekTrades.length > 0;
              const linkHref = hasTrade ? `/month/${slug}/week/${week.weekNumber}` : "#";

              return (
                <Link
                  key={week.weekNumber}
                  href={linkHref}
                  className={`rail-row ${hasTrade ? "linked" : "locked"}`}
                >
                  <div className="rail-day">
                    {monthLabel}<b>{startDay}–{endDay}</b>
                  </div>
                  <div className="rail-body">
                    <h4>Minggu {week.weekNumber}</h4>
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
        </div>
      </section>

      <div className="ink-divider"></div>

      <section>
        <div className="wrap">
          <div className="sec-head"><h2>Catatan Bulanan</h2></div>
          <div style={{ maxWidth: 640, color: "var(--text-muted)", fontSize: 16, lineHeight: 1.85, marginBottom: 60 }}>
            <p>{monthlyNote}</p>
            <div className="placeholder-note" style={{ marginTop: 12 }}>
              ✏️ Untuk mengubah catatan, edit variabel <code>MONTHLY_NOTES</code> di <code>app/month/[slug]/page.tsx</code>.
            </div>
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
