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

// Helper: Get week ranges for a month
export function getMonthWeeks(year: number, month: number) {
  const weeks: { weekNumber: number; start: Date; end: Date; label: string }[] = [];
  
  // Find first Sunday of the month
  const firstDay = new Date(year, month, 1);
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(firstDay.getDate() - firstDay.getDay()); // Go back to Sunday
  
  // Find last Friday of the month
  const lastDay = new Date(year, month + 1, 0);
  const lastFriday = new Date(lastDay);
  lastFriday.setDate(lastDay.getDate() - (lastDay.getDay() === 6 ? 0 : lastDay.getDay() + 1)); // Go to Friday
  
  let current = new Date(firstSunday);
  let weekNum = 1;
  
  while (current <= lastFriday) {
    const start = new Date(current);
    const end = new Date(current);
    end.setDate(current.getDate() + 5); // Friday
    
    // Only include weeks that overlap with the month
    if (end >= firstDay) {
      weeks.push({
        weekNumber: weekNum,
        start: new Date(start),
        end: new Date(end),
        label: `Minggu ${weekNum} · ${start.getDate()}–${end.getDate()} ${getMonthName(end.getMonth())} ${end.getFullYear()}`
      });
      weekNum++;
    }
    
    current.setDate(current.getDate() + 7); // Next Sunday
  }
  
  return weeks;
}

function getMonthName(month: number): string {
  const names = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return names[month];
}
