import Link from "next/link";
import { fetchTrades } from "@/lib/notion";

export const revalidate = 60;

export default async function HomePage() {
  const trades = await fetchTrades();

  // Group by month
  const monthMap: Record<string, any[]> = {};
  for (const t of trades) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(t);
  }

  const monthKeys = Object.keys(monthMap).sort().reverse();
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

  const totalSessions = trades.length;
  const setupA = trades.filter((t) => t.grade === "A").length;
  const violations = trades.filter((t) => t.notes?.toLowerCase().includes("pelanggaran")).length;
  const netR = trades.reduce(
    (sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0),
    0
  );

  return (
    <>
      {/* Nav */}
      <nav className="site-nav">
        <div className="wrap">
          <div className="brand">
            <span className="mark"></span> EL-DOCUMENTARY
          </div>
          <div className="crumbs">
            <span className="here">2026</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="wrap">
          <div className="eyebrow">Kumpulan seluruh data</div>
          <h1>
            The<br />
            <em>Journey</em>
          </h1>
          <p className="lede">
            Semua hasil backtest, fronttest dan juga eksekusi trade secara real tersimpan dalam satu journal{" "}
            <strong>konsistensi persiapan dari pra week</strong> — adaptasi di minggu tersebut hingga review ulang kembali di hari sabtu
          </p>
        </div>
      </header>

      {/* Blade Rule */}
      <div className="blade-rule on-scroll wrap" style={{ maxWidth: 1080 }}></div>

      {/* Stat Strip */}
      <section>
        <div className="wrap">
          <div className="stat-strip">
            <div className="stat">
              <div className="stat-label">Jumlah Trade</div>
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
        </div>
      </section>

      {/* Months Grid */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <h2>2026</h2>
            <p>
              Setiap bulan menyimpan minggu-minggunya. Setiap minggu menyimpan hari-harinya.
              Tidak ada yang dilewatkan, termasuk minggu-minggu yang berjalan buruk.
            </p>
          </div>

          <div className="grid cols-3">
            {monthKeys.map((key) => {
              const [year, month] = key.split("-");
              const monthName = monthNames[month] || month;
              const monthTrades = monthMap[key];
              return (
                <Link key={key} href={`/month/${year}-${month}`} className="tile">
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

            {/* Locked future month */}
            <div className="tile locked">
              <div className="tile-eyebrow">
                <span>BULAN 09</span>
                <span className="lock-icon">🔒</span>
              </div>
              <h3>September</h3>
              <p>Belum ditempa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ink Divider */}
      <div className="ink-divider"></div>

      {/* About Section */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <h2>Mengapa Ini Dibuat</h2>
          </div>
          <div
            style={{
              maxWidth: 640,
              color: "var(--text-muted)",
              fontSize: 16,
              lineHeight: 1.85,
              marginBottom: 60,
            }}
          >
            <p style={{ margin: "0 0 16px" }}>
              Yang Metal ingin memotong bersih lalu melangkah pergi. Ia tidak secara alami mau
              berdiam dengan sebuah trade yang rugi dan menuliskan, dalam kalimat penuh,
              tepatnya di mana pembacaan itu keliru. Ketidaknyamanan itu justru adalah intinya.
            </p>
            <p style={{ margin: "0 0 16px" }}>
              Setiap entri di sini mengikuti bentuk yang sama: apa yang saya harapkan sebelum
              sesi, apa yang sebenarnya dilakukan pasar, di mana keduanya berbeda, dan apa yang
              saya ubah karenanya. Tidak ada entri yang dihapus karena memalukan.{" "}
              <strong style={{ color: "var(--text)" }}>
                Kerugian tetap ditampilkan. Itulah yang membuat catatan ini jujur.
              </strong>
            </p>
            <p style={{ margin: 0 }}>
              Air adalah elemen yang masih kurang dalam diri saya — mengalir, beradaptasi,
              membiarkan rencana melentur tanpa patah. Seluruh proyek ini adalah usaha untuk
              membangunnya.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="wrap">
          <div className="blade-rule static" style={{ marginBottom: 36 }}></div>
          <div className="quote">
            "Pedang tidak mengingat dulunya ia besi.<br />Catatan ini yang mengingatnya."
          </div>
          <div className="foot-meta">
            EL Documentary · JURNAL TRADING · DIPERBARUI SETIAP MINGGU
          </div>
        </div>
      </footer>
    </>
  );
}
