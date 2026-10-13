import Link from "next/link";
import { fetchTrades, getAssetType } from "@/lib/notion";

export const revalidate = 60;

const monthNames: Record<string, string> = {
  "01": "Januari",
  "02": "Februari",
  "03": "Maret",
  "04": "April",
  "05": "Mei",
  "06": "Juni",
  "07": "Juli",
  "08": "Agustus",
  "09": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Desember",
};

export default async function HomePage() {
  const allTrades = await fetchTrades();
  const trades = allTrades.filter((t) => t.status === "Entered" && t.isTrade === true);

  const futuresTrades = trades.filter((t) => getAssetType(t.instrument) === "futures");
  const forexTrades = trades.filter((t) => getAssetType(t.instrument) === "forex");

  const lessonCount = allTrades.filter(
    (t) => t.chartLesson && t.chartLesson.trim().length > 0
  ).length;

  return (
    <>
      <header style={{ marginBottom: "40px" }}>
        <div className="eyebrow">TRADING LOG</div>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontWeight: 900,
            fontSize: "clamp(48px, 8vw, 80px)",
            lineHeight: "1",
            color: "var(--text)",
          }}
        >
          <em style={{ fontStyle: "normal", color: "var(--water-bright)" }}>Journey</em>
        </h1>
      </header>

      <div className="blade-rule" style={{ marginBottom: "48px" }} />

      {/* ===== FUTURES SECTION ===== */}
      <AssetSection
        title="Futures"
        subtitle="NQ · ES · MNQ · MES · YM"
        trades={futuresTrades}
        type="futures"
        monthNames={monthNames}
      />

      <div className="ink-divider" style={{ margin: "56px 0" }} />

      {/* ===== FOREX SECTION ===== */}
      <AssetSection
        title="Forex"
        subtitle="EU · GU · UJ · AU"
        trades={forexTrades}
        type="forex"
        monthNames={monthNames}
      />

      {/* ===== COMPILED LESSONS ===== */}
      <section style={{ marginTop: "80px", marginBottom: "64px" }}>
        <h2
          style={{
            fontFamily: "var(--display)",
            fontWeight: 700,
            fontSize: "clamp(28px, 3vw, 40px)",
            color: "var(--text)",
            marginBottom: "16px",
          }}
        >
          Pelajaran Chart
        </h2>
        <Link
          href="/lessons"
          className="tile"
          style={{
            display: "block",
            textDecoration: "none",
            border: "1px solid var(--border-soft)",
            background: "var(--surface)",
          }}
        >
          <div className="tile-eyebrow">
            <span>COMPILED LESSONS</span>
            <span className="tile-arrow">→</span>
          </div>
          <h3>Semua Pelajaran dalam Satu Halaman</h3>
          <p>
            Kumpulan pelajaran chart dari setiap trade — diurutkan dari yang terbaru.
            Tempat untuk melihat pola dan perkembangan sepanjang perjalanan.
          </p>
          <div className="tile-stats">
            <span>
              <b>{lessonCount}</b> pelajaran tercatat
            </span>
            <span>
              <b>→ Buka</b>
            </span>
          </div>
        </Link>
      </section>

      <footer className="site-footer" style={{ paddingTop: "32px", marginTop: "0" }}>
        <div className="blade-rule static" style={{ marginBottom: "36px" }} />
        <div className="footer-quotes">
          <div className="quote">
            "Shokunin 職人.<br />Bentuk pelatihan mencari kesempurnaan dengan sadar bahwa itu mustahil dicapai."
          </div>
          <div className="quote right">
            "Kaizen 改善.<br />Proses menjadi lebih baik 1% setiap hari — perbaikan berkelanjutan."
          </div>
        </div>
        <div className="foot-meta">
          EL-DOCUMENTARY · JURNAL TRADING · DIPERBARUI SETIAP MINGGU
        </div>
      </footer>
    </>
  );
}

// ===== Reusable Asset Section =====
function AssetSection({
  title,
  subtitle,
  trades,
  type,
  monthNames,
}: {
  title: string;
  subtitle: string;
  trades: any[];
  type: "futures" | "forex";
  monthNames: Record<string, string>;
}) {
  const monthMap: Record<string, any[]> = {};
  for (const t of trades) {
    const d = new Date(t.date);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(t);
  }
  const monthKeys = Object.keys(monthMap).sort().reverse();

  const totalSessions = trades.length;
  const setupA = trades.filter((t) => t.grade === "A").length;
  const violations = 0;
  const netR = trades.reduce(
    (sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0),
    0
  );

  return (
    <section style={{ marginBottom: "48px" }}>
      <div style={{ marginBottom: "24px" }}>
        <div className="eyebrow">{type === "futures" ? "FUTURES" : "FOREX"}</div>
        <h2
          style={{
            fontFamily: "var(--display)",
            fontWeight: 800,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: "var(--text)",
            lineHeight: "1",
            marginBottom: "6px",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: "var(--text-faint)",
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </p>
      </div>

      <div className="stat-strip" style={{ marginBottom: "32px" }}>
        <div className="stat">
          <div className="stat-label">Sesi Tercatat</div>
          <div className="stat-value">{totalSessions}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Setup A+ / A</div>
          <div className="stat-value gold">{setupA}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Pelanggaran</div>
          <div className="stat-value rust">{violations}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Net R</div>
          <div className={`stat-value ${netR >= 0 ? "water" : "rust"}`}>
            {netR >= 0 ? "+" : ""}
            {netR.toFixed(1)}R
          </div>
        </div>
      </div>

      {monthKeys.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
          Belum ada data {title.toLowerCase()}.
        </p>
      ) : (
        <div className="grid cols-3">
          {monthKeys.map((key) => {
            const [, month] = key.split("-");
            const monthName = monthNames[month] || month;
            const monthTrades = monthMap[key];
            const instruments = [...new Set(monthTrades.map((t) => t.instrument))];
            return (
              <Link
                key={key}
                href={`/month/${key}?type=${type}`}
                className="tile"
              >
                <div className="tile-eyebrow">
                  <span>BULAN {month}</span>
                  <span className="tile-arrow">→</span>
                </div>
                <h3>{monthName}</h3>
                <p>{monthTrades.length} trade tercatat</p>
                <div className="tile-stats">
                  <span>
                    <b>{monthTrades.length}</b> trade
                  </span>
                  <span>
                    <b>{instruments.join(" / ")}</b>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
