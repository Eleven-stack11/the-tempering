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

  const allWeekEntries = allTrades.filter((t) => {
    const d = new Date(t.date);
    return d >= targetWeek.start && d <= targetWeek.end;
  });

  const trades = allWeekEntries.filter(t => t.isTrade === true);
  const readings = allWeekEntries.filter(t => t.isTrade === false && t.notes && t.notes.trim().length > 0);

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
  const startDate = targetWeek.start;
  const endDate = targetWeek.end;
  const monthLabel = monthName.slice(0, 3).toUpperCase();

  const youtubeId = getYoutubeId(weeklyYoutube);

  const wins = trades.filter(t => t.result === "Win").length;
  const losses = trades.filter(t => t.result === "Loss").length;

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          {/* Judul kiri */}
          <div>
            <div className="font-['Big_Shoulders'] font-black text-[clamp(28px,4.5vw,52px)] leading-tight">
              MINGGU {localWeekNumber} · {monthLabel} {startDate.getDate()} – {monthLabel} {endDate.getDate()}
            </div>
          </div>

          {/* ===== STATISTIK — RIGHT-ALIGNED, TIDAK MELEBAR ===== */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-4 gap-x-5 text-sm font-mono text-[#A6A39C] bg-[#1A1918] border border-[#2C2A27] rounded-lg px-5 py-2">
              <div className="text-center">
                <div className="text-[#6E6B65] uppercase tracking-wider text-[9px]">Trade</div>
                <div className="font-bold text-[#E8E6E1] text-base">{trades.length}</div>
              </div>
              <div className="text-center border-l border-[#2C2A27] pl-4">
                <div className="text-[#6E6B65] uppercase tracking-wider text-[9px]">Net R</div>
                <div className={`font-bold text-base ${netR >= 0 ? 'text-[#2E5695]' : 'text-[#8B3A1F]'}`}>
                  {netR >= 0 ? '+' : ''}{netR.toFixed(1)}R
                </div>
              </div>
              <div className="text-center border-l border-[#2C2A27] pl-4">
                <div className="text-[#6E6B65] uppercase tracking-wider text-[9px]">Win</div>
                <div className="font-bold text-[#C49A3C] text-base">{wins}</div>
              </div>
              <div className="text-center border-l border-[#2C2A27] pl-4">
                <div className="text-[#6E6B65] uppercase tracking-wider text-[9px]">Loss</div>
                <div className="font-bold text-[#8B3A1F] text-base">{losses}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== TESIS PRA-PASAR ===== */}
      <section className="mb-10 border-b border-[#221F1C] pb-8">
        <div className="eyebrow water text-base md:text-lg">TESIS PRA-PASAR</div>
        <div className="body-copy text-base md:text-lg mt-2">
          {weeklyThesis ? (
            <div className="whitespace-pre-wrap text-[#E8E6E1]">{weeklyThesis}</div>
          ) : (
            <p className="text-[#6E6B65] italic">Belum ada tesis untuk minggu ini.</p>
          )}
        </div>
        {youtubeId && (
          <div className="mx-auto max-w-xs mt-4">
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

      <div className="blade-rule on-scroll" style={{ marginBottom: 40 }}></div>

      {/* ===== MINGGU INI ===== */}
      <section className="mb-10">
        <div className="sec-head">
          <h2 className="text-3xl md:text-4xl">Minggu Ini</h2>
          <p className="text-base md:text-lg text-[#A6A39C]">
            Lima sesi kontak dengan rencana di atas. Hari yang terkunci adalah hari yang tidak dicatat — itu juga adalah data.
          </p>
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

      <div className="ink-divider"></div>

      {/* ===== REVIEW MINGGUAN ===== */}
      <section>
        <div className="sec-head">
          <h2 className="text-3xl md:text-4xl">Sabtu — Rincian Lengkap</h2>
          <p className="text-base md:text-lg text-[#A6A39C]">
            Tesis hari Minggu dibandingkan dengan apa yang benar-benar terjadi. Tidak ada revisi rencana setelah kejadian.
          </p>
        </div>

        <div className="journal-section">
          <div className="eyebrow text-base md:text-lg">PSIKOLOGI</div>
          <div className="pull">
            {psychology ? (
              <p className="text-lg md:text-xl">{psychology}</p>
            ) : (
              <p className="text-[#6E6B65] italic text-base md:text-lg">Belum ada catatan psikologi.</p>
            )}
          </div>
          <div className="body-copy text-base md:text-lg">
            {psychology ? (
              <div className="whitespace-pre-wrap text-[#E8E6E1]">{psychology}</div>
            ) : (
              <p className="text-[#6E6B65] italic">Belum ada catatan psikologi.</p>
            )}
          </div>
        </div>

        <div className="journal-section">
          <div className="eyebrow steel text-base md:text-lg">PELAJARAN CHART</div>
          <div className="body-copy text-base md:text-lg">
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
          <div className="stat-strip">
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
