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

  const weeks = getWeeksOfMonth(yearNum, monthIndex);
  const targetWeek = weeks.find((w) => w.weekNumber === weekNumber);
  if (!targetWeek) notFound();

  const localWeekIndex = weeks.findIndex((w) => w.weekNumber === weekNumber);
  const localWeekNumber = localWeekIndex !== -1 ? localWeekIndex + 1 : weekNumber;

  const weekTrades = allTrades.filter((t) => {
    const d = new Date(t.date);
    return d >= targetWeek.start && d <= targetWeek.end;
  });

  if (weekTrades.length === 0) notFound();

  const weeklyThesis = weekTrades[0]?.weeklyThesis || '';
  const psychology = weekTrades[0]?.psychology || '';
  const chartLesson = weekTrades[0]?.chartLesson || '';

  const dayMap: Record<string, any[]> = {};
  for (const t of weekTrades) {
    const key = new Date(t.date).toISOString().split("T")[0];
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(t);
  }
  const dayKeys = Object.keys(dayMap).sort();

  const netR = weekTrades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);

  // Gunakan targetWeek.start dan targetWeek.end untuk rentang tanggal yang benar
  const startDate = targetWeek.start;
  const endDate = targetWeek.end;
  const monthLabel = monthName.slice(0, 3).toUpperCase();

  return (
    <>
      {/* ===== NAVIGASI ATAS: Kembali ke Bulan & Beranda SEJAJAR ===== */}
      <div className="flex items-center justify-between py-3 px-4 border-b border-[#221F1C] mb-8">
        <Link
          href={`/month/${slug}`}
          className="text-sm font-mono text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 uppercase tracking-wider flex items-center gap-1"
        >
          <span>←</span> Kembali ke {monthName}
        </Link>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 flex items-center gap-1.5"
        >
          <span>←</span> Beranda
        </Link>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* ===== HEADER UTAMA — rentang tanggal diperbaiki ===== */}
        <header className="mb-10 mt-2">
          <div className="font-['Big_Shoulders'] font-black text-[clamp(28px,4.5vw,52px)] leading-tight">
            MINGGU {localWeekNumber} · {monthLabel} {startDate.getDate()} – {monthLabel} {endDate.getDate()}
          </div>
          <p className="text-lg md:text-xl text-[#A6A39C] mt-2">
            {weekTrades.length} trade tercatat minggu ini. Net R {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R
          </p>
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

          <div className="rail text-base md:text-lg">
            {dayKeys.map((dayKey) => {
              const d = new Date(dayKey);
              const dayName = dayNames[d.getDay()];
              const dayTrades = dayMap[dayKey];
              const dayR = dayTrades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);
              const grade = dayTrades[0]?.grade || "B";
              const daySlug = dayKey;

              return (
                <Link
                  key={dayKey}
                  href={`/month/${slug}/week/${weekNum}/day/${daySlug}`}
                  className="rail-row linked py-4 md:py-5 px-4 md:px-6"
                >
                  <div className="rail-day text-base md:text-lg">
                    {dayName}
                    <b className="text-2xl md:text-3xl">{d.getDate()}</b>
                  </div>
                  <div className="rail-body">
                    <h4 className="text-lg md:text-xl font-medium">
                      {dayTrades.length} trade — {dayTrades.map(t => t.title).join(", ")}
                    </h4>
                    <p className="text-base md:text-lg text-[#A6A39C]">
                      {dayTrades.map(t => `${t.instrument} ${t.direction}`).join(" · ")}
                    </p>
                  </div>
                  <div className={`seal ${dayR >= 0 ? "win" : "loss"} w-10 h-10 md:w-12 md:h-12 text-base md:text-lg`}>
                    <span>{grade}</span>
                  </div>
                  <div className={`rail-tag text-base md:text-2xl font-bold tracking-wider ${dayR >= 0 ? "text-[#2E5695]" : "text-[#8B3A1F]"}`}>
                    {dayR >= 0 ? "+" : ""}{dayR.toFixed(1)}R
                  </div>
                </Link>
              );
            })}

            {/* Hari kosong */}
            {[0, 1, 2, 3, 4].map((i) => {
              const d = new Date(targetWeek.start);
              d.setDate(d.getDate() + i);
              if (d > targetWeek.end) return null;
              const dayKey = d.toISOString().split("T")[0];
              if (dayMap[dayKey]) return null;
              const dayName = dayNames[d.getDay()];
              return (
                <div key={i} className="rail-row locked py-4 md:py-5 px-4 md:px-6">
                  <div className="rail-day text-base md:text-lg">
                    {dayName}
                    <b className="text-2xl md:text-3xl">{d.getDate()}</b>
                  </div>
                  <div className="rail-body">
                    <h4 className="text-lg md:text-xl font-medium">Tidak ada sesi tercatat</h4>
                  </div>
                  <div className="rail-tag"></div>
                  <div className="rail-tag"></div>
                </div>
              );
            })}

            {/* Review Sabtu */}
            <div className="rail-row review py-4 md:py-5 px-4 md:px-6">
              <div className="rail-day text-base md:text-lg" style={{ color: "var(--gold)" }}>
                SAB
              </div>
              <div className="rail-body">
                <h4 className="text-lg md:text-xl font-medium" style={{ color: "var(--gold)" }}>
                  Review Mingguan
                </h4>
                <p className="text-base md:text-lg text-[#A6A39C]">
                  Rincian lengkap di bawah — tidak ada halaman terpisah, semuanya ada di halaman ini
                </p>
              </div>
              <div className="rail-tag"></div>
              <div className="rail-tag"></div>
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

          {/* PSIKOLOGI */}
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

          {/* PELAJARAN CHART */}
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

          {/* HASIL */}
          <div className="journal-section">
            <div className="eyebrow text-base md:text-lg">HASIL</div>
            <div className="stat-strip">
              <div className="stat">
                <div className="stat-label text-sm md:text-base">Trade Diambil</div>
                <div className="stat-value text-3xl md:text-5xl">{weekTrades.length}</div>
              </div>
              <div className="stat">
                <div className="stat-label text-sm md:text-base">Grade</div>
                <div className="stat-value gold text-3xl md:text-5xl">{weekTrades[0]?.grade || "B"}</div>
              </div>
              <div className="stat">
                <div className="stat-label text-sm md:text-base">Net R</div>
                <div className={`stat-value text-3xl md:text-5xl ${netR >= 0 ? "water" : "rust"}`}>
                  {netR >= 0 ? "+" : ""}{netR.toFixed(1)}R
                </div>
              </div>
              <div className="stat">
                <div className="stat-label text-sm md:text-base">Pelanggaran Aturan</div>
                <div className="stat-value text-3xl md:text-5xl">0</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
