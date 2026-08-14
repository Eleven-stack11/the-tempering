const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function fetchTrades(): Promise<any[]> {
  // Cek kredensial
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    console.error("❌ Notion credentials missing. Check your .env.local or Vercel environment variables.");
    return [];
  }

  try {
    console.log("🔍 Fetching trades from Notion...");
    console.log(`📚 Database ID: ${NOTION_DATABASE_ID.slice(0, 8)}...`);

    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        sorts: [{ property: "Date", direction: "descending" }],
        page_size: 100, // Batasi untuk menghindari timeout
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Notion API error (${response.status}):`, errorText);
      
      // Cek error spesifik
      if (response.status === 401) {
        console.error("🔑 Token Notion tidak valid. Periksa NOTION_TOKEN di environment variables.");
      } else if (response.status === 404) {
        console.error("📄 Database Notion tidak ditemukan. Periksa NOTION_DATABASE_ID.");
      }
      
      return [];
    }

    const data = await response.json();
    console.log(`✅ Berhasil mengambil ${data.results?.length || 0} data dari Notion`);

    if (!data.results || data.results.length === 0) {
      console.log("ℹ️ Tidak ada data di database Notion.");
      return [];
    }

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
    console.error("❌ Error fetching from Notion:", error);
    return [];
  }
}

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

export function getWeeksOfMonth(year: number, monthIndex: number): Array<{ weekNumber: number; start: Date; end: Date }> {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  let currentMonday = new Date(firstDayOfMonth);
  while (currentMonday.getDay() !== 1) {
    currentMonday.setDate(currentMonday.getDate() + 1);
  }

  const weeks = [];
  let weekNumber = 1;

  while (currentMonday <= lastDayOfMonth) {
    const friday = new Date(currentMonday);
    friday.setDate(friday.getDate() + 4);

    let daysInMonth = 0;
    let day = new Date(currentMonday);
    while (day <= friday) {
      if (day >= firstDayOfMonth && day <= lastDayOfMonth) {
        daysInMonth++;
      }
      day.setDate(day.getDate() + 1);
    }

    if (daysInMonth >= 3) {
      weeks.push({
        weekNumber,
        start: new Date(currentMonday),
        end: new Date(friday),
      });
      weekNumber++;
    }

    currentMonday.setDate(currentMonday.getDate() + 7);
  }

  return weeks;
}
