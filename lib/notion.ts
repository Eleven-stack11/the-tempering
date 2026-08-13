const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function fetchTrades(): Promise<any[]> {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    console.warn("Notion credentials missing");
    return [];
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        sorts: [{ property: "Date", direction: "descending" }],
      }),
    });

    if (!res.ok) {
      console.error("Notion API error:", res.status);
      return [];
    }

    const data = await res.json();

    return data.results.map((page: any) => {
      const p = page.properties;
      return {
        id: page.id,
        date: p.Date?.date?.start || "",
        title: p.Title?.title?.[0]?.plain_text || "Untitled",
        instrument: p.Instrument?.select?.name || "NQ",
        direction: p.Direction?.select?.name || "Long",
        trigger: p.Trigger?.rich_text?.[0]?.plain_text || "",
        result: p.Result?.select?.name || "Scratch",
        grade: p.Grade?.select?.name || "B",
        r: p.R?.number || 0,
        notes: p.Notes?.rich_text?.[0]?.plain_text || "",
        link: p.Link?.url || "",
      };
    });
  } catch (error) {
    console.error("Error fetching Notion:", error);
    return [];
  }
}

// ============================================================
// FUNGSI MINGGU YANG SUDAH DIUJI UNTUK AGUSTUS 2026
// ============================================================

// Fungsi ini tetap dipakai
export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

/**
 * Menghasilkan minggu-minggu (Senin–Jumat) dalam satu bulan.
 * Aturan: minggu dianggap milik bulan jika memiliki minimal 3 hari kerja di bulan tersebut.
 * Contoh Agustus 2026:
 *   Minggu 1: 3–7 Agustus
 *   Minggu 2: 10–14 Agustus
 *   Minggu 3: 17–21 Agustus
 *   Minggu 4: 24–28 Agustus
 *   (Minggu 31 Agustus – 4 September tidak masuk Agustus)
 */
export function getWeeksOfMonth(year: number, monthIndex: number): Array<{ weekNumber: number; start: Date; end: Date }> {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  // Cari Senin pertama yang <= firstDayOfMonth
  let startMonday = new Date(firstDayOfMonth);
  while (startMonday.getDay() !== 1) {
    startMonday.setDate(startMonday.getDate() - 1);
  }

  const weeks = [];
  let weekNumber = 1;
  let currentMonday = new Date(startMonday);

  while (currentMonday <= lastDayOfMonth) {
    // Jumat = Senin + 4 hari
    const friday = new Date(currentMonday);
    friday.setDate(friday.getDate() + 4);

    // Hitung berapa hari (Senin–Jumat) yang termasuk dalam bulan ini
    let daysInMonth = 0;
    let day = new Date(currentMonday);
    while (day <= friday) {
      if (day >= firstDayOfMonth && day <= lastDayOfMonth) {
        daysInMonth++;
      }
      day.setDate(day.getDate() + 1);
    }

    // Jika minimal 3 hari di bulan ini, masukkan ke daftar
    if (daysInMonth >= 3) {
      weeks.push({
        weekNumber,
        start: new Date(currentMonday),
        end: new Date(friday),
      });
      weekNumber++;
    } else {
      // Jika kurang dari 3 hari, minggu ini milik bulan berikutnya → berhenti
      break;
    }

    // Lanjut ke Senin berikutnya
    currentMonday.setDate(currentMonday.getDate() + 7);
  }

  return weeks;
}
