import Link from "next/link";
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

export default async function LessonsPage() {
  const allTrades = await fetchTrades();

  // Ambil hanya trade yang punya pelajaran chart
  const lessons = allTrades
    .filter((t) => t.chartLesson && t.chartLesson.trim().length > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by month
  const monthGroups: Record<string, typeof lessons> = {};
  for (const lesson of lessons) {
    const d = new Date(lesson.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthGroups[key]) monthGroups[key] = [];
    monthGroups[key].push(lesson);
  }
  const monthKeys = Object.keys(monthGroups).sort().reverse();

  return (
    <>
      {/* Header */}
      <header style={{ marginBottom: "40px" }}>
        <div className="eyebrow">COMPILED LESSONS</div>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontWeight: 900,
            fontSize: "clamp(48px, 8vw, 80px)",
            lineHeight: "1",
            color: "var(--text)",
          }}
        >
          <em style={{ fontStyle: "normal", color: "var(--water-bright)" }}>
            Pelajaran Chart
          </em>
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "16px",
            marginTop: "12px",
            maxWidth: "560px",
          }}
        >
          Semua pelajaran yang pernah dicatat dari setiap trade — dari yang terbaru ke
          yang terlama. Tempat untuk melihat pola dan perkembangan.
        </p>
      </header>

      <div className="blade-rule" style={{ marginBottom: "32px" }} />

      {/* Statistik ringkas */}
      <section style={{ marginBottom: "48px" }}>
        <div className="stat-strip">
          <div className="stat">
            <div className="stat-label">Total Pelajaran</div>
            <div className="stat-value">{lessons.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Bulan dengan Pelajaran</div>
            <div className="stat-value water">{monthKeys.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Pelajaran Terbaru</div>
            <div className="stat-value gold" style={{ fontSize: "20px" }}>
              {lessons.length > 0
                ? new Date(lessons[0].date).toLocaleDateString("id", {
                    day: "numeric",
                    month: "short",
                  })
                : "—"}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Instrumen</div>
            <div className="stat-value" style={{ fontSize: "20px" }}>
              {[...new Set(lessons.map((l) => l.instrument))].join(" / ") || "—"}
            </div>
          </div>
        </div>
      </section>

      {/* List per bulan */}
      {monthKeys.length === 0 ? (
        <section>
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            Belum ada pelajaran chart yang tercatat. Isi properti{" "}
            <code>Pelajaran Chart</code> di Notion untuk memulai.
          </p>
        </section>
      ) : (
        monthKeys.map((monthKey) => {
          const [year, month] = monthKey.split("-");
          const monthIdx = parseInt(month) - 1;
          const monthName = monthNames[Object.keys(monthNames)[monthIdx]];
          const monthLessons = monthGroups[monthKey];

          return (
            <section key={monthKey} style={{ marginBottom: "56px" }}>
              {/* Month header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "12px",
                  marginBottom: "20px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--display)",
                    fontWeight: 700,
                    fontSize: "clamp(24px, 3vw, 32px)",
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {monthName} {year}
                </h2>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "12px",
                    color: "var(--text-faint)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {monthLessons.length} pelajaran
                </span>
              </div>

              {/* Lessons list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {monthLessons.map((lesson) => {
                  const d = new Date(lesson.date);
                  const dayName = dayNames[d.getDay()];
                  const isWin = lesson.result === "Win";
                  const isLoss = lesson.result === "Loss";

                  return (
                    <Link
                      key={lesson.id}
                      href={`/month/${monthKey}/week/${getWeekNum(d)}/day/${lesson.date}`}
                      style={{
                        display: "block",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "20px 24px",
                        transition: "background 0.15s, border-color 0.15s",
                        textDecoration: "none",
                      }}
                      className="lesson-card"
                    >
                      {/* Meta row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--text-faint)",
                          }}
                        >
                          {dayName} {d.getDate()}
                        </span>
                        <span style={{ color: "var(--border)" }}>·</span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            letterSpacing: "0.08em",
                            color: "var(--text-muted)",
                          }}
                        >
                          {lesson.instrument} {lesson.direction}
                        </span>
                        <span style={{ color: "var(--border)" }}>·</span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: isWin
                              ? "var(--gold)"
                              : isLoss
                              ? "var(--rust)"
                              : "var(--steel)",
                          }}
                        >
                          {lesson.grade} · {isWin ? "WIN" : isLoss ? "LOSS" : "BE"}
                        </span>
                      </div>

                      {/* Lesson text */}
                      <p
                        style={{
                          color: "var(--text)",
                          fontSize: "15px",
                          lineHeight: "1.7",
                          margin: 0,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {lesson.chartLesson}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {/* CSS tambahan untuk hover */}
      <style>{`
        .lesson-card:hover {
          background: var(--surface-2) !important;
          border-color: var(--gold-dim) !important;
        }
      `}</style>
    </>
  );
}

// Helper: hitung nomor minggu (sama seperti di lib/notion)
function getWeekNum(d: Date): number {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}
