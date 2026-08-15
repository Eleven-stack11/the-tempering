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

  const allTrades = await fetchTrades();

  // Dapatkan semua minggu dalam bulan ini
  const weeks = getWeeksOfMonth(yearNum, monthIndex);

  // Cari minggu yang sesuai dengan weekNumber
  const targetWeek = weeks.find((w) => w.weekNumber === weekNumber);
  if (!targetWeek) notFound();

  // Cari urutan minggu lokal (1,2,3,4)
  const localWeekIndex = weeks.findIndex((w) => w.weekNumber === weekNumber);
  const localWeekNumber = localWeekIndex !== -1 ? localWeekIndex + 1 : weekNumber;

  // Filter trades yang jatuh di antara start dan end minggu tersebut
  const weekTrades = allTrades.filter((t) => {
    const d = new Date(t.date);
    return d >= targetWeek.start && d <= targetWeek.end;
  });

  if (weekTrades.length === 0) notFound();

  // Ambil data dari trade pertama (asumsi satu minggu punya isi yang sama)
  const weeklyThesis = weekTrades[0]?.weeklyThesis || '';
  const psychology = weekTrades[0]?.psychology || '';
  const chartLesson = weekTrades[0]?.chartLesson || '';

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
      {/* Tombol kembali ke homepage */}
      <div className="flex justify-end items-center py-3 px-4 border-b border-[#221F1C] mb-4">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 flex items-center gap-1.5"
        >
          <span>←</span> Beranda
        </Link>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Tombol kembali ke bulan */}
        <div className="mb-4">
          <Link
            href={`/month/${slug}`}
            className="inline-flex items-center gap-1 text-sm font-mono text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 uppercase tracking-wider"
          >
            <span>←</span> Kembali ke {monthName}
          </Link>
        </div>

        <header className="hero" style={{ padding: "64px 0 40px" }}>
          <div className="wrap" style={{ padding: 0 }}>
            <div className="eyebrow water">
              MINGGU {localWeekNumber} · {monthLabel} {first.getDate()} – {monthLabel} {last.getDate()}
            </div>
            <h1 style={{ fontSize: "clamp(40px, 6.5vw, 72px)" }}>Trade log</h1>
            <p className="lede">{weekTrades.length} trade tercatat minggu ini. Net R {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R</p>
          </div>
        </header>

        <section>
          <div className="wrap" style={{ padding: 0 }}>
            <div className="journal-section" style={{ paddingTop: 0, borderBottom: "1px solid var(--border-soft)" }}>
              <div className="eyebrow water">TESIS PRA-PASAR</div>
              <div className="body-copy">
                {weeklyThesis ? (
                  <div className="whitespace-pre-wrap text-[#E8E6E1]">{weeklyThesis}</div>
                ) : (
                  <p className="text-[#6E6B65] italic">Belum ada tesis untuk minggu ini. Tambahkan properti <code>Weekly Thesis</code> di Notion.</p>
                )}
              </div>
              <div className="placeholder-note">
                ✏️ Untuk mengedit, isi properti <code>Weekly Thesis</code> (Rich Text) di database Notion.
              </div>
            </div>
          </div>
        </section>

        <div className="blade-rule on-scroll" style={{ maxWidth: "100%", margin: "20px 0" }}></div>

        <section>
          <div className="wrap" style={{ padding: 0 }}>
            <div className="sec-head">
              <h2>Minggu Ini</h2>

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
          <div className="wrap" style={{ padding: 0 }}>
            <div className="sec-head">
              <h2>Sabtu — Review</h2>

            {/* --- TESIS VS REALITA --- dihapus sesuai permintaan, tidak ditampilkan --- */}

            {/* --- PSIKOLOGI --- */}
            <div className="journal-section">
              <div className="eyebrow">PSIKOLOGI</div>
              <div className="pull">
                {psychology ? (
                  <p>{psychology}</p>
                ) : (
                  <p className="text-[#6E6B65] italic">✏️ Isi properti <code>Psikologi</code> di Notion untuk refleksi minggu ini.</p>
                )}
              </div>
              <div className="body-copy">
                {psychology ? (
                  <div className="whitespace-pre-wrap text-[#E8E6E1]">{psychology}</div>
                ) : (
                  <p className="text-[#6E6B65] italic">Belum ada catatan psikologi.</p>
                )}
              </div>
            </div>

            {/* --- PELAJARAN CHART --- */}
            <div className="journal-section">
              <div className="eyebrow steel">PELAJARAN CHART</div>
              <div className="body-copy">
                {chartLesson ? (
                  <div className="whitespace-pre-wrap text-[#E8E6E1]">
                    <p><strong>✏️ Satu pelajaran utama:</strong> {chartLesson}</p>
                  </div>
                ) : (
                  <p className="text-[#6E6B65] italic">
                    <strong>✏️ Satu pelajaran utama, jangan lebih dari itu.</strong> Isi properti <code>Pelajaran Chart</code> di Notion.
                  </p>
                )}
              </div>

            {/* --- HASIL (tetap hardcode, tidak dari Notion) --- */}
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
      </div>
    </>
  );
}
