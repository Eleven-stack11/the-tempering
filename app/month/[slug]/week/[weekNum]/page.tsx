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

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/embed\/)([\w-]+)/,
    /(?:youtube\.com\/v\/)([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default async function WeekPage({ params }: { params: Promise<{ slug: string; weekNum: string }> }) {
  const { slug, weekNum } = await params;
  const [year, month] = slug.split("-");
  const yearNum = parseInt(year);
  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[Object.keys(monthNames)[monthIndex]];
  const weekNumber = parseInt(weekNum);

  const allTrades = await fetchTrades();

  const weeks = getWeeksOfMonth(yearNum, monthIndex);
  const targetWeek = weeks.find((w) => w.weekNumber === weekNumber);
  if (!targetWeek) notFound();

  const localWeekIndex = weeks.findIndex((w) => w.weekNumber === weekNumber);
  const localWeekNumber = localWeekIndex !== -1 ? localWeekIndex + 1 : weekNumber;

  // Sunday trade untuk thesis
  const sundayDate = new Date(targetWeek.start);
  sundayDate.setDate(sundayDate.getDate() - 1);
  const sundayTrade = allTrades.find((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === sundayDate.getFullYear() &&
           d.getMonth() === sundayDate.getMonth() &&
           d.getDate() === sundayDate.getDate();
  });

  const weeklyThesis = sundayTrade?.weeklyThesis || sundayTrade?.notes || '';
  const weeklyYoutube = sundayTrade?.link || '';
  const psychology = sundayTrade?.psychology || '';
  const chartLesson = sundayTrade?.chartLesson || '';

  // Semua entri dalam rentang minggu
  const allWeekEntries = allTrades.filter((t) => {
    const d = new Date(t.date);
    return d >= targetWeek.start && d <= targetWeek.end;
  });

  const trades = allWeekEntries.filter(t => t.isTrade === true);
  const readings = allWeekEntries.filter(t => t.isTrade === false && t.notes && t.notes.trim().length > 0);

  // Gabungkan dalam dayMap
  const dayMap: Record<string, { trades: any[]; readings: any[] }> = {};
  for (const t of trades) {
    const key = new Date(t.date).toISOString().split("T")[0];
    if (!dayMap[key]) dayMap[key] = { trades: [], readings: [] };
    dayMap[key].trades.push(t);
  }
  for (const r of readings) {
    const key = new Date(r.date).toISOString().split("T")[0];
    if (!dayMap[key]) dayMap[key] = { trades: [], readings: [] };
    dayMap[key].readings.push(r);
  }

  const netR = trades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);
  const winCount = trades.filter(t => t.result === "Win").length;
  const lossCount = trades.filter(t => t.result === "Loss").length;
  const startDate = targetWeek.start;
  const endDate = targetWeek.end;
  const monthLabel = monthName.slice(0, 3).toUpperCase();

  const youtubeId = getYoutubeId(weeklyYoutube);

  return (
    <>
      {/* ===== HEADER: SEJAJAR LURUS KIRI & KANAN (1 BARIS HORIZONTAL) ===== */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginTop: '1rem',
          marginBottom: '3rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #221F1C'
        }}
      >
        {/* Judul Kiri */}
        <div
          style={{
            fontFamily: "'Big Shoulders', sans-serif",
            fontWeight: 900,
            fontSize: '1.75rem',
            letterSpacing: '0.025em',
            color: '#FFFFFF',
            whiteSpace: 'nowrap'
          }}
        >
          MINGGU {localWeekNumber} · {monthLabel} {startDate.getDate()} – {monthLabel} {endDate.getDate()}
        </div>

        {/* Data Trade Kanan — Mengisi Ruang Kosong Kanan */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.85rem',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.875rem',
            color: '#A6A39C',
            whiteSpace: 'nowrap'
          }}
        >
          <span>
            <span style={{ color: '#6E6B65' }}>Trade </span>
            <strong style={{ color: '#E8E6E1', fontWeight: 700 }}>{trades.length}</strong>
          </span>

          <span style={{ color: '#56534E' }}>·</span>

          <span>
            <span style={{ color: '#6E6B65' }}>Net R </span>
            <strong style={{ color: netR >= 0 ? '#2E5695' : '#8B3A1F', fontWeight: 700 }}>
              {netR >= 0 ? '+' : ''}{netR.toFixed(1)}R
            </strong>
          </span>

          <span style={{ color: '#56534E' }}>·</span>

          <span>
            <span style={{ color: '#6E6B65' }}>Win </span>
            <strong style={{ color: '#C49A3C', fontWeight: 700 }}>{winCount}</strong>
          </span>

          <span style={{ color: '#56534E' }}>·</span>

          <span>
            <span style={{ color: '#6E6B65' }}>Loss </span>
            <strong style={{ color: '#8B3A1F', fontWeight: 700 }}>{lossCount}</strong>
          </span>
        </div>
      </header>

      {/* ===== TESIS PRA-PASAR ===== */}
      <section className="mb-12 border-b border-[#221F1C] pb-10">
        <div className="eyebrow water text-base md:text-lg">TESIS PRA-PASAR</div>
        <div className="body-copy text-base md:text-lg mt-3">
          {weeklyThesis ? (
            <div className="whitespace-pre-wrap text-[#E8E6E1]">{weeklyThesis}</div>
          ) : (
            <p className="text-[#6E6B65] italic">Belum ada tesis untuk minggu ini.</p>
          )}
        </div>
        {youtubeId && (
          <div className="mx-auto max-w-xs mt-6">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="text-sm text-[#A6A39C] mt-2 text-center">📹 Weekly Thesis — klik play untuk menonton</div>
          </div>
        )}
      </section>

      {/* ===== MINGGU INI ===== */}
      <section className="mb-12">
        <div className="sec-head mb-6">
          <h2 className="text-3xl md:text-4xl">Minggu Ini</h2>
        </div>

        <div className="rail">
          {[1, 2, 3, 4, 5].map((dayOffset) => {
            const d = new Date(targetWeek.start);
            d.setDate(d.getDate() + (dayOffset - 1));
            if (d > targetWeek.end) return null;
            const dayKey = d.toISOString().split("T")[0];
            const dayData = dayMap[dayKey] || { trades: [], readings: [] };
            const dayName = dayNames[d.getDay()];

            const hasTrade = dayData.trades.length > 0;
            const hasReading = dayData.readings.length > 0;

            if (hasTrade) {
              const dayTrades = dayData.trades;
              const dayR = dayTrades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);
              const grade = dayTrades[0]?.grade || "B";
              const daySlug = dayKey;

              return (
                <Link key={dayKey} href={`/month/${slug}/week/${weekNum}/day/${daySlug}`} className="rail-row linked">
                  <div className="rail-day">
                    {dayName}
                    <b>{d.getDate()}</b>
                  </div>
                  <div className="rail-body">
                    <h4>{dayTrades.length} trade — {dayTrades.map(t => t.title).join(", ")}</h4>
                    <p>{dayTrades.map(t => `${t.instrument} ${t.direction}`).join(" · ")}</p>
                    {hasReading && (
                      <p className="text-sm text-[#6E6B65] mt-1">
                        📝 + {dayData.readings.length} update reading
                      </p>
                    )}
                  </div>
                  <div className={`rail-badge ${dayR >= 0 ? "win" : "loss"}`}>
                    <span>{grade}</span>
                  </div>
                  <div className={`rail-r ${dayR >= 0 ? "win" : "loss"}`}>
                    {dayR >= 0 ? "+" : ""}{dayR.toFixed(1)}R
                  </div>
                </Link>
              );
            }

            if (hasReading) {
              const readingTexts = dayData.readings.map(r => r.notes || r.praPasar || '').filter(t => t.length > 0);
              return (
                <div key={dayKey} className="rail-row empty">
                  <div className="rail-day">
                    {dayName}
                    <b>{d.getDate()}</b>
                  </div>
                  <div className="rail-body">
                    <h4 className="text-[#C49A3C]">📝 Update Reading</h4>
                    {readingTexts.map((text, idx) => (
                      <p key={idx} className="text-sm text-[#A6A39C] italic mt-1">“{text.slice(0, 120)}”</p>
                    ))}
                  </div>
                  <div></div>
                  <div></div>
                </div>
              );
            }

            return (
              <div key={dayKey} className="rail-row empty">
                <div className="rail-day">
                  {dayName}
                  <b>{d.getDate()}</b>
                </div>
                <div className="rail-body">
                  <h4>Tidak ada sesi tercatat</h4>
                </div>
                <div></div>
                <div></div>
              </div>
            );
          })}

          <div className="rail-row review-row">
            <div className="rail-day" style={{ color: "var(--gold)" }}>SAB</div>
            <div className="rail-body">
              <h4 style={{ color: "var(--gold)" }}>Review Mingguan</h4>
              <p>Rincian lengkap di bawah — tidak ada halaman terpisah, semuanya ada di halaman ini</p>
            </div>
            <div></div>
            <div></div>
          </div>
        </div>
      </section>

      <div className="ink-divider my-10"></div>

      {/* ===== REVIEW MINGGUAN ===== */}
      <section>
        <div className="sec-head mb-6">
          <h2 className="text-3xl md:text-4xl">Sabtu — Rincian Lengkap</h2>
          <p className="text-base md:text-lg text-[#A6A39C] mt-1">
            Tesis hari Minggu dibandingkan dengan apa yang benar-benar terjadi. Tidak ada revisi rencana setelah kejadian.
          </p>
        </div>

        <div className="journal-section mb-8">
          <div className="eyebrow text-base md:text-lg">PSIKOLOGI</div>
          <div className="pull mt-2">
            {psychology ? (
              <p className="text-lg md:text-xl">{psychology}</p>
            ) : (
              <p className="text-[#6E6B65] italic text-base md:text-lg">Belum ada catatan psikologi.</p>
            )}
          </div>
          <div className="body-copy text-base md:text-lg mt-2">
            {psychology ? (
              <div className="whitespace-pre-wrap text-[#E8E6E1]">{psychology}</div>
            ) : (
              <p className="text-[#6E6B65] italic">Belum ada catatan psikologi.</p>
            )}
          </div>
        </div>

        <div className="journal-section mb-8">
          <div className="eyebrow steel text-base md:text-lg">PELAJARAN CHART</div>
          <div className="body-copy text-base md:text-lg mt-2">
            {chartLesson ? (
              <div className="whitespace-pre-wrap text-[#E8E6E1]">
                <p className="text-lg md:text-xl font-medium">✏️ Satu pelajaran utama:</p>
                <p>{chartLesson}</p>
              </div>
            ) : (
              <p className="text-[#6E6B65] italic">
                <strong>✏️ Satu pelajaran utama, jangan lebih dari itu.</strong> Belum diisi.
              </p>
            )}
          </div>
        </div>

        <div className="journal-section">
          <div className="eyebrow text-base md:text-lg">HASIL</div>
          <div className="stat-strip mt-3">
            <div className="stat">
              <div className="stat-label">Trade Diambil</div>
              <div className="stat-value">{trades.length}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Grade</div>
              <div className="stat-value gold">{sundayTrade?.grade || "B"}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Net R</div>
              <div className={`stat-value ${netR >= 0 ? "water" : "rust"}`}>
                {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Pelanggaran Aturan</div>
              <div className="stat-value">0</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
