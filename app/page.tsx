import Link from "next/link";
import { fetchTrades } from "@/lib/notion";

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
    <div className="page-container" style={{ paddingTop: "24px", paddingBottom: "48px" }}>
      {/* ===== HEADER ===== */}
      <header style={{ marginBottom: "40px" }}>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: "8px",
          }}
        >
          TRADING LOG
        </div>
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

      <div
        style={{
          height: "1px",
          width: "100%",
          background: "var(--border-soft)",
          marginBottom: "32px",
        }}
      />

      {/* ===== STATISTIK ===== */}
      <section style={{ marginBottom: "48px" }}>
        <div className="stat-strip">
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
      </section>

      {/* ===== 2026 & BULAN ===== */}
      <section style={{ marginBottom: "64px" }}>
        <h2
          style={{
            fontFamily: "var(--display)",
            fontWeight: 700,
            fontSize: "clamp(28px, 3vw, 40px)",
            color: "var(--text)",
            marginBottom: "16px",
          }}
        >
          2026
        </h2>

        <div className="grid cols-3">
          {monthKeys.map((key) => {
            const [, month] = key.split("-");
            const monthName = monthNames[month] || month;
            const monthTrades = monthMap[key];
            return (
              <Link key={key} href={`/month/${key}`} className="tile">
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
                    <b>NQ / ES</b>
                  </span>
                </div>
              </Link>
            );
          })}
          <div className="tile locked">
            <div className="tile-eyebrow">
              <span>BULAN 09</span>
              <span className="lock-icon">🔒</span>
            </div>
            <h3>September</h3>
            <p>Belum ditempa.</p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER — SHOKUNIN (KIRI) & KAIZEN (KANAN) ===== */}
      <footer
        style={{
          paddingTop: "32px",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Desktop: flex row, Mobile: flex column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
            }}
            className="md:flex-row"
          >
            {/* Kiri — Shokunin */}
            <div style={{ maxWidth: "480px", textAlign: "left" }}>
              <h4
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "var(--text)",
                  marginBottom: "4px",
                }}
              >
                "Shokunin 職人."
              </h4>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                Bentuk pelatihan mencari kesempurnaan dengan sadar bahwa itu mustahil dicapai.
              </p>
            </div>

            {/* Kanan — Kaizen */}
            <div
              style={{
                maxWidth: "480px",
                textAlign: "left",
              }}
              className="md:text-right"
            >
              <h4
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "var(--text)",
                  marginBottom: "4px",
                }}
              >
                "Kaizen 改善."
              </h4>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                Proses menjadi lebih baik 1% setiap hari — perbaikan berkelanjutan.
              </p>
            </div>
          </div>

          {/* Media query untuk desktop: Kaizen rata kanan */}
          <style>{`
            @media (min-width: 768px) {
              .md\\:flex-row {
                flex-direction: row !important;
              }
              .md\\:text-right {
                text-align: right !important;
              }
            }
          `}</style>
        </div>

        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-faint)",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-soft)",
          }}
        >
          EL-DOCUMENTARY · JURNAL TRADING · DIPERBARUI SETIAP MINGGU
        </div>
      </footer>
    </div>
  );
}
