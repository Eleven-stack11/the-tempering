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
const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default async function WeekPage({ params }: { params: Promise<{ slug: string; weekNum: string }> }) {
  const { slug, weekNum } = await params;
  const [year, month] = slug.split("-");
  const yearNum = parseInt(year);
  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[Object.keys(monthNames)[monthIndex]];
  const weekNumber = parseInt(weekNum);

  // Ambil semua trade dari Notion
  const allTrades = await fetchTrades();

  // Dapatkan daftar minggu untuk bulan ini (sama seperti halaman bulan)
  const weeks = getWeeksOfMonth(yearNum, monthIndex);

  // Cari minggu yang sesuai dengan weekNumber
  const targetWeek = weeks.find((w) => w.weekNumber === weekNumber);
  if (!targetWeek) notFound();

  // Filter trades yang jatuh di antara start dan end minggu tersebut
  const weekTrades = allTrades.filter((t) => {
    const d = new Date(t.date);
    return d >= targetWeek.start && d <= targetWeek.end;
  });

  if (weekTrades.length === 0) notFound();

  // Group by day
  const dayMap: Record<string, any[]> = {};
  for (const t of weekTrades) {
    const key = new Date(t.date).toISOString().split("T")[0];
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(t);
  }
  const dayKeys = Object.keys(dayMap).sort();

  const netR = weekTrades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);
  const first = new Date(weekTrades[0].date);
  const last = new Date(weekTrades[weekTrades.length - 1].date);
  const monthLabel = monthName.slice(0, 3).toUpperCase();

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
            <span className="here">Minggu {weekNumber}</span>
          </div>
        </div>
      </nav>

      <header className="hero" style={{ padding: "64px 0 40px" }}>
        <div className="wrap">
          <div className="eyebrow water">
            MINGGU {weekNumber} · {monthLabel} {first.getDate()} – {monthLabel} {last.getDate()}
          </div>
          <h1 style={{ fontSize: "clamp(40px, 6.5vw, 72px)" }}>Bacaan Hari Minggu</h1>
          <p className="lede">{weekTrades.length} trade tercatat minggu ini. Net R {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R</p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="journal-section" style={{ paddingTop: 0, borderBottom: "1px solid var(--border-soft)" }}>
            <div className="eyebrow water">TESIS PRA-PASAR</div>
            <div className="body-copy">
              <p>✏️ Tulis tesis hari Minggu di sini — atau tambahkan sebagai properti di Notion.</p>
            </div>
            <div className="placeholder-note">✏️ Isi kotak ini setiap hari Minggu sebelum minggu dimulai. Tempelkan screenshot daily/4H kalau perlu.</div>
          </div>
        </div>
      </section>

      <div className="blade-rule on-scroll wrap" style={{ maxWidth: 1080 }}></div>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <h2>Minggu Ini</h2>
            <p>Lima sesi kontak dengan rencana di atas. Hari yang terkunci adalah hari yang tidak dicatat — itu juga adalah data.</p>
          </div>

          <div className="rail">
            {dayKeys.map((dayKey) => {
              const d = new Date(dayKey);
              const dayName = dayNames[d.getDay()];
              const dayTrades = dayMap[dayKey];
              const dayR = dayTrades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);
              const grade = dayTrades[0]?.grade || "B";
              const daySlug = dayKey;

              return (
                <Link key={dayKey} href={`/month/${slug}/week/${weekNum}/day/${daySlug}`} className="rail-row linked">
                  <div className="rail-day">
                    {dayName}<b>{d.getDate()}</b>
                  </div>
                  <div className="rail-body">
                    <h4>{dayTrades.length} trade — {dayTrades.map(t => t.title).join(", ")}</h4>
                    <p>{dayTrades.map(t => `${t.instrument} ${t.direction}`).join(" · ")}</p>
                  </div>
                  <div className={`seal ${dayR >= 0 ? "win" : "loss"}`}>
                    <span>{grade}</span>
                  </div>
                  <div className={`rail-tag ${dayR >= 0 ? "text-[#2E5695]" : "text-[#8B3A1F]"}`}>
                    {dayR >= 0 ? "+" : ""}{dayR.toFixed(1)}R
                  </div>
                </Link>
              );
            })}

            {/* Tampilkan hari Senin–Jumat yang tidak ada trade */}
            {[0, 1, 2, 3, 4].map((i) => {
              const d = new Date(targetWeek.start);
              d.setDate(d.getDate() + i);
              if (d > targetWeek.end) return null;
              const dayKey = d.toISOString().split("T")[0];
              if (dayMap[dayKey]) return null;
              const dayName = dayNames[d.getDay()];
              return (
                <div key={i} className="rail-row locked">
                  <div className="rail-day">
                    {dayName}<b>{d.getDate()}</b>
                  </div>
                  <div className="rail-body"><h4>Tidak ada sesi tercatat</h4></div>
                  <div className="rail-tag"></div>
                  <div className="rail-tag"></div>
                </div>
              );
            })}

            <div className="rail-row review">
              <div className="rail-day" style={{ color: "var(--gold)" }}>SAB</div>
              <div className="rail-body">
                <h4 style={{ color: "var(--gold)" }}>Review Mingguan</h4>
                <p>Rincian lengkap di bawah — tidak ada halaman terpisah, semuanya ada di halaman ini</p>
              </div>
              <div className="rail-tag"></div>
              <div className="rail-tag"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="ink-divider"></div>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <h2>Sabtu — Rincian Lengkap</h2>
            <p>Tesis hari Minggu dibandingkan dengan apa yang benar-benar terjadi. Tidak ada revisi rencana setelah kejadian.</p>
          </div>

          <div className="journal-section" style={{ paddingTop: 0 }}>
            <div className="eyebrow gold">TESIS VS. REALITA</div>
            <div className="body-copy">
              <p>✏️ Bandingkan rencana hari Minggu dengan apa yang sebenarnya terjadi sepanjang minggu.</p>
            </div>
          </div>

          <div className="journal-section">
            <div className="eyebrow">PSIKOLOGI</div>
            <div className="pull">
              <p>✏️ Satu kalimat kunci soal psikologi minggu ini.</p>
            </div>
            <div className="body-copy">
              <p>✏️ Refleksi lebih panjang — apa yang dirasakan, apa polanya, apa yang perlu diperhatikan minggu depan.</p>
            </div>
          </div>

          <div className="journal-section">
            <div className="eyebrow steel">PELAJARAN CHART</div>
            <div className="body-copy">
              <p><strong>✏️ Satu pelajaran utama, jangan lebih dari itu.</strong> ✏️ Jelaskan pelajarannya dalam 2-3 kalimat.</p>
            </div>
          </div>

          <div className="journal-section">
            <div className="eyebrow">HASIL</div>
            <div className="stat-strip" style={{ marginTop: 8 }}>
              <div className="stat"><div className="stat-label">Trade Diambil</div><div className="stat-value">{weekTrades.length}</div></div>
              <div className="stat"><div className="stat-label">Grade</div><div className="stat-value gold">{weekTrades[0]?.grade || "B"}</div></div>
              <div className="stat"><div className="stat-label">Net R</div><div className={`stat-value ${netR >= 0 ? "water" : "rust"}`}>{netR >= 0 ? "+" : ""}{netR.toFixed(1)}R</div></div>
              <div className="stat"><div className="stat-label">Pelanggaran Aturan</div><div className="stat-value">0</div></div>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap">
          <div className="blade-rule static" style={{ marginBottom: 36 }}></div>
          <div className="foot-meta">THE TEMPERING · MINGGU {weekNumber} · <Link href={`/month/${slug}`} style={{ color: "var(--gold)" }}>↑ KEMBALI KE {monthName}</Link></div>
        </div>
      </footer>
    </>
  );
}
