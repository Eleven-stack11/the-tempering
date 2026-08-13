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

  return (
    <>
      <nav className="site-nav">
        <div className="wrap">
          <div className="brand"><span className="mark"></span> THE TEMPERING</div>
          <div className="crumbs">
            <Link href="/">2026</Link>
            <span className="sep">/</span>
            <Link href={`/month/${slug}`}>{monthName}</Link>
            <span className="sep">/</span>
            <Link href={`/month/${slug}/week/${weekNum}`}>Minggu {weekNum}</Link>
            <span className="sep">/</span>
            <span className="here">{dayNames[d.getDay()]} {d.getDate()}</span>
          </div>
        </div>
      </nav>

      <header className="day-hero">
        <div className="wrap">
          <div className="day-hero-top">
            <div>
              <div className="eyebrow water">{dayNames[d.getDay()].toUpperCase()} · {d.getDate()} {monthName} {year} · LONDON</div>
              <h1 style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: "clamp(36px, 5.5vw, 60px)", margin: 0, lineHeight: 1 }}>
                {trade.instrument} {trade.direction} —<br />{trade.title}
              </h1>
            </div>
            <div className={`seal ${isWin ? "win" : "loss"}`} style={{ width: 56, height: 56, fontSize: 18 }}>
              <span>{trade.grade}</span>
            </div>
          </div>

          <div className="day-meta">
            <div className="day-meta-item">Instrumen<b>{trade.instrument}</b></div>
            <div className="day-meta-item">Arah<b>{trade.direction}</b></div>
            <div className="day-meta-item">Trigger Entry<b>{trade.trigger || "—"}</b></div>
            <div className={`day-meta-item ${isLoss ? "outcome-loss" : isWin ? "outcome-win" : ""}`}>
              Hasil<b>{isWin ? `+${trade.r}R · Profit` : isLoss ? `−${trade.r}R · Rugi` : `${trade.r}R · Scratch`}</b>
            </div>
          </div>
        </div>
      </header>

      <section className="journal-section">
        <div className="wrap">
          <div className="eyebrow water">BACAAN PRA-PASAR</div>
          <h3>Sebelum sesi dimulai</h3>
          <div className="body-copy">
            <p>✏️ Tulis bacaan pra-pasar di sini — atau tambahkan sebagai properti di Notion.</p>
          </div>
        </div>
      </section>

      <section className="journal-section">
        <div className="wrap">
          <div className="eyebrow steel">APA YANG DILAKUKAN HARGA — TOP DOWN</div>
          <h3>Daily → 4H → 1H → 15M → 3M</h3>
          <div className="body-copy">
            <p><strong>Daily:</strong> ✏️ Apa yang terlihat di timeframe daily.</p>
            <p><strong>4H:</strong> ✏️ Apa yang terlihat di timeframe 4H.</p>
            <p><strong>1H:</strong> ✏️ Apa yang terlihat di timeframe 1H.</p>
            <p><strong>3M:</strong> ✏️ Detail eksekusi entry.</p>
          </div>
          <div className="placeholder-note">✏️ Tempelkan screenshot chart di sini — atau tambahkan link dari Notion.</div>
        </div>
      </section>

      <section className="journal-section">
        <div className="wrap">
          <div className="eyebrow gold">DI MANA BACAAN INI BENAR / SALAH</div>
          <h3>Pembagian yang jujur</h3>
          <div className="body-copy">
            <p><strong>Benar:</strong> ✏️ Bagian mana dari bacaan/eksekusi yang benar.</p>
            <p><strong>Salah:</strong> ✏️ Bagian mana yang meleset, sejujur mungkin.</p>
          </div>
          <div className="pull">
            <p>✏️ Satu kalimat kunci — pelajaran psikologis dari trade ini.</p>
          </div>
        </div>
      </section>

      <section className="journal-section">
        <div className="wrap">
          <div className="eyebrow water">ADAPTASI</div>
          <h3>Apa yang berubah</h3>
          <div className="body-copy">
            <p>✏️ Apa yang diubah atau dilakukan berbeda karena trade ini.</p>
          </div>
        </div>
      </section>

      <section className="journal-section">
        <div className="wrap">
          <div className="eyebrow steel">REKAMAN SESI</div>
          <h3>Rekaman layar — dari pra-pasar sampai exit</h3>
          <div className="video-slot">
            <div className="play">▶</div>
          </div>
          {trade.link && (
            <div className="video-caption">
              <a href={trade.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>
                📹 Buka rekaman di Notion →
              </a>
            </div>
          )}
          <details className="transcript">
            <summary>Transkrip</summary>
            <div className="transcript-body">✏️ Transkrip video di sini.</div>
          </details>
        </div>
      </section>

      <section className="journal-section">
        <div className="wrap">
          <div className="eyebrow">HASIL</div>
          <h3>Grade & hasil akhir</h3>
          <div className="stat-strip">
            <div className="stat"><div className="stat-label">Grade Setup</div><div className="stat-value gold">{trade.grade}</div></div>
            <div className="stat"><div className="stat-label">Hasil Akhir</div><div className={`stat-value ${isWin ? "gold" : "rust"}`}>{isWin ? "Profit" : isLoss ? "Rugi" : "Scratch"}</div></div>
            <div className="stat"><div className="stat-label">Hasil R</div><div className={`stat-value ${isWin ? "water" : "rust"}`}>{isWin ? "+" : ""}{trade.r}R</div></div>
            <div className="stat"><div className="stat-label">Pelanggaran Aturan</div><div className="stat-value">0</div></div>
          </div>
          <div className="body-copy" style={{ marginTop: 28 }}>
            <p>✏️ Kesimpulan jujur soal grade ini — kenapa dapat grade itu, dan apa perbaikan konkret untuk lain kali.</p>
          </div>
        </div>
      </section>

      <div className="entry-nav">
        <Link href={`/month/${slug}/week/${weekNum}`} className="prev">← KEMBALI KE<b>Minggu {weekNum}</b></Link>
        <Link href={`/month/${slug}/week/${weekNum}`} className="next">MINGGU LENGKAP<b>Review Sabtu →</b></Link>
      </div>

      <footer className="site-footer">
        <div className="wrap">
          <div className="foot-meta" style={{ marginTop: 24 }}>THE TEMPERING · {d.getDate()} {monthName} {year}</div>
        </div>
      </footer>
    </>
  );
}
