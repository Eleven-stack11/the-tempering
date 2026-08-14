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

  // ===== FILTER: hanya trade dengan status "Entered" =====
  const trades = allTrades.filter((t) => t.status === "Entered");

  // Kelompokkan berdasarkan bulan
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
  const violations = 0; // sesuaikan jika Anda punya properti violations
  const netR = trades.reduce(
    (sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0),
    0
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Hero */}
      <header className="mb-12">
        <div className="eyebrow">SEBUAH CATATAN, BUKAN SEKADAR SOROTAN</div>
        <h1 className="font-['Big_Shoulders'] font-black text-[clamp(48px,8vw,96px)] leading-[0.92] mb-4">
          <em className="text-[#2E5695] not-italic">Journey</em>
        </h1>
        <p className="text-[#A6A39C] text-lg max-w-2xl leading-relaxed">
          Bongkahan besi tidak berubah jadi pedang secara kebetulan. Ia masuk ke dalam api,
          ditempa, didinginkan, lalu dimasukkan lagi.{" "}
          <strong className="text-[#E8E6E1]">Inilah proses itu, dituliskan</strong> — pembacaan
          pasar setiap minggu, di mana bacaan itu keliru, dan apa yang berubah sesudahnya.
        </p>
      </header>

      {/* Blade Rule */}
      <div className="blade-rule on-scroll" style={{ marginBottom: 40 }}></div>

      {/* Stat Strip */}
      <section className="mb-12">
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
              {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R
            </div>
          </div>
        </div>
      </section>

      {/* Grid Bulan */}
      <section>
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
      </section>

      {/* Ink Divider */}
      <div className="ink-divider"></div>

      {/* About */}
      <section>
        <div className="sec-head">
          <h2>Mengapa Ini Dibuat</h2>
        </div>
        <div className="max-w-2xl text-[#A6A39C] text-base leading-relaxed mb-12">
          <p className="mb-4">
            Yang Metal ingin memotong bersih lalu melangkah pergi. Ia tidak secara alami mau
            berdiam dengan sebuah trade yang rugi dan menuliskan, dalam kalimat penuh, tepatnya
            di mana pembacaan itu keliru. Ketidaknyamanan itu justru adalah intinya.
          </p>
          <p className="mb-4">
            Setiap entri di sini mengikuti bentuk yang sama: apa yang saya harapkan sebelum
            sesi, apa yang sebenarnya dilakukan pasar, di mana keduanya berbeda, dan apa yang
            saya ubah karenanya. Tidak ada entri yang dihapus karena memalukan.{" "}
            <strong className="text-[#E8E6E1]">
              Kerugian tetap ditampilkan. Itulah yang membuat catatan ini jujur.
            </strong>
          </p>
          <p>
            Air adalah elemen yang masih kurang dalam diri saya — mengalir, beradaptasi,
            membiarkan rencana melentur tanpa patah. Seluruh proyek ini adalah usaha untuk
            membangunnya.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="blade-rule static" style={{ marginBottom: 36 }}></div>
        <div className="quote">
          "Pedang tidak mengingat dulunya ia besi.<br />Catatan ini yang mengingatnya."
        </div>
        <div className="foot-meta">EL-DOCUMENTARY · JURNAL TRADING · DIPERBARUI SETIAP MINGGU</div>
      </footer>
    </div>
  );
}
