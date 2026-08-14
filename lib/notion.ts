const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Helper untuk ambil properti dari Notion
function getProp(page: any, propName: string): any {
  const prop = page.properties[propName];
  if (!prop) return undefined;
  if (prop.type === 'select') return prop.select?.name;
  if (prop.type === 'number') return prop.number;
  if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text;
  if (prop.type === 'title') return prop.title?.[0]?.plain_text;
  if (prop.type === 'date') return prop.date?.start;
  if (prop.type === 'url') return prop.url;
  return undefined;
}

// Helper untuk parsing RR (misal: "2R" → 2, "-1R" → -1, "BE" → 0)
function parseRR(rr: string | undefined): { value: number; result: 'Win' | 'Loss' | 'Scratch' } {
  if (!rr) return { value: 0, result: 'Scratch' };
  const trimmed = rr.trim().toUpperCase();
  if (trimmed === 'BE') return { value: 0, result: 'Scratch' };
  const match = trimmed.match(/^([+-]?\d+(\.\d+)?)R$/);
  if (match) {
    const num = parseFloat(match[1]);
    if (num > 0) return { value: num, result: 'Win' };
    if (num < 0) return { value: Math.abs(num), result: 'Loss' };
    return { value: 0, result: 'Scratch' };
  }
  // Fallback: cek apakah ada kata Win/Loss
  if (trimmed.includes('WIN')) return { value: 1, result: 'Win' };
  if (trimmed.includes('LOSS')) return { value: 1, result: 'Loss' };
  return { value: 0, result: 'Scratch' };
}

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
      // === MAPPING PROPERTI ===
      const date = getProp(page, 'Date') || '';
      const details = getProp(page, 'Details') || '';
      const monthlyNote = getProp(page, 'Monthly Note') || '';
      const position = getProp(page, 'Position') || 'Long';
      const rrRaw = getProp(page, 'RR') || '0R';
      const setupGrade = getProp(page, 'Setup Grade') || 'B';
      const status = getProp(page, 'Status') || 'Entered';
      const youtube = getProp(page, 'YouTube') || '';

      // Ambil filter-filter penting sebagai trigger description
      const dailyFilter = getProp(page, 'Daily filter') || '';
      const h4Filter = getProp(page, '4H filter') || '';
      const h1Filter = getProp(page, '1H close filter') || '';
      const m15Filter = getProp(page, '15M filter') || '';
      const m5Filter = getProp(page, '5M filter') || '';
      const m3Filter = getProp(page, '3M filter') || '';

      // Gabungkan filter menjadi trigger string
      const triggerParts = [];
      if (dailyFilter) triggerParts.push(`Daily: ${dailyFilter}`);
      if (h4Filter) triggerParts.push(`4H: ${h4Filter}`);
      if (h1Filter) triggerParts.push(`1H: ${h1Filter}`);
      if (m15Filter) triggerParts.push(`15M: ${m15Filter}`);
      if (m5Filter) triggerParts.push(`5M: ${m5Filter}`);
      if (m3Filter) triggerParts.push(`3M: ${m3Filter}`);
      const trigger = triggerParts.join(' · ') || '—';

      // Parse RR
      const rrData = parseRR(rrRaw);

      // Tentukan grade final (prioritas: Setup Grade)
      let grade = 'B';
      if (setupGrade === 'A+' || setupGrade === 'A') grade = 'A';
      else if (setupGrade === 'B') grade = 'B';
      else if (setupGrade === 'C') grade = 'C';
      // Jika hasil loss, turunkan grade? tidak, biarkan sesuai setup.

      return {
        id: page.id,
        date: date,
        title: details.slice(0, 60) || 'Untitled', // potong jika terlalu panjang
        instrument: 'NQ', // bisa juga dari properti Instrument jika ada
        direction: position === 'Short' ? 'Short' : 'Long',
        trigger: trigger,
        result: rrData.result,
        grade: grade,
        r: rrData.value,
        notes: details || monthlyNote || '',
        link: youtube || '',
        createdAt: page.created_time,
      };
    });
  } catch (error) {
    console.error("Error fetching Notion:", error);
    return [];
  }
}

// ===== FUNGSI LAIN (tetap) =====
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

  let start = new Date(firstDayOfMonth);
  while (start.getDay() !== 1) {
    start.setDate(start.getDate() - 1);
  }

  const weeks = [];
  let current = new Date(start);
  while (current <= lastDayOfMonth) {
    const end = new Date(current);
    end.setDate(end.getDate() + 4);
    let daysInMonth = 0;
    let day = new Date(current);
    while (day <= end) {
      if (day >= firstDayOfMonth && day <= lastDayOfMonth) daysInMonth++;
      day.setDate(day.getDate() + 1);
    }
    if (daysInMonth >= 3) {
      weeks.push({
        weekNumber: getWeekNumber(current),
        start: new Date(current),
        end: new Date(end),
      });
    }
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}
