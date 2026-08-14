const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

function parseRR(value: any): { value: number; result: 'Win' | 'Loss' | 'Scratch' } {
  if (value === undefined || value === null || value === '') {
    return { value: 0, result: 'Scratch' };
  }
  if (typeof value === 'number') {
    if (value > 0) return { value, result: 'Win' };
    if (value < 0) return { value: Math.abs(value), result: 'Loss' };
    return { value: 0, result: 'Scratch' };
  }
  const str = String(value).trim().toUpperCase();
  if (['BE', 'B/E', 'SCRATCH', '0', '0R', '0 R'].includes(str)) {
    return { value: 0, result: 'Scratch' };
  }
  const match = str.match(/^([+-]?(\d+(\.\d+)?))R?$/);
  if (match) {
    const num = parseFloat(match[1]);
    if (num > 0) return { value: num, result: 'Win' };
    if (num < 0) return { value: Math.abs(num), result: 'Loss' };
    return { value: 0, result: 'Scratch' };
  }
  if (str.includes('WIN')) return { value: 1, result: 'Win' };
  if (str.includes('LOSS')) return { value: 1, result: 'Loss' };
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
      const date = page.properties.Date?.date?.start || '';
      const details = page.properties.Details?.rich_text?.[0]?.plain_text || '';
      const monthlyNote = page.properties['Monthly Note']?.rich_text?.[0]?.plain_text || '';
      const position = page.properties.Position?.select?.name || 'Long';

      // === WEEKLY THESIS ===
      const weeklyThesis = page.properties['Weekly Thesis']?.rich_text?.[0]?.plain_text || '';

      // === PSIKOLOGI & PELAJARAN CHART ===
      const psychology = page.properties['Psikologi']?.rich_text?.[0]?.plain_text || '';
      const chartLesson = page.properties['Pelajaran Chart']?.rich_text?.[0]?.plain_text || '';

      // Ambil RR (support multi_select & select)
      let rrRaw = null;
      const rrProp = page.properties.RR;
      if (rrProp) {
        if (rrProp.type === 'select') {
          rrRaw = rrProp.select?.name;
        } else if (rrProp.type === 'multi_select') {
          rrRaw = rrProp.multi_select?.[0]?.name || null;
        } else if (rrProp.type === 'rich_text') {
          rrRaw = rrProp.rich_text?.[0]?.plain_text;
        } else if (rrProp.type === 'number') {
          rrRaw = rrProp.number;
        } else if (rrProp.type === 'title') {
          rrRaw = rrProp.title?.[0]?.plain_text;
        }
      }

      const halfRisk = page.properties['Half risk (if not...)']?.checkbox || false;
      const setupGrade = page.properties['Setup Grade']?.select?.name || 'B';
      const youtube = page.properties.YouTube?.url || '';
      const status = page.properties.Status?.select?.name || 'Entered';

      const dailyFilter = page.properties['Daily filter']?.select?.name || '';
      const h4Filter = page.properties['4H filter']?.select?.name || '';
      const h1Filter = page.properties['1H close filter']?.select?.name || '';
      const m15Filter = page.properties['15M filter']?.select?.name || '';
      const m5Filter = page.properties['5M filter']?.select?.name || '';
      const m3Filter = page.properties['3M filter']?.select?.name || '';

      const triggerParts = [];
      if (dailyFilter) triggerParts.push(`Daily:${dailyFilter}`);
      if (h4Filter) triggerParts.push(`4H:${h4Filter}`);
      if (h1Filter) triggerParts.push(`1H:${h1Filter}`);
      if (m15Filter) triggerParts.push(`15M:${m15Filter}`);
      if (m5Filter) triggerParts.push(`5M:${m5Filter}`);
      if (m3Filter) triggerParts.push(`3M:${m3Filter}`);
      const trigger = triggerParts.join(' · ') || '—';

      let rrData = parseRR(rrRaw);
      if (halfRisk && rrData.result !== 'Scratch') {
        rrData.value = rrData.value / 2;
      }

      let grade = 'B';
      if (setupGrade === 'A+' || setupGrade === 'A') grade = 'A';
      else if (setupGrade === 'B' || setupGrade === 'B+') grade = 'B';
      else if (setupGrade === 'C') grade = 'C';

      return {
        id: page.id,
        date: date,
        title: details.slice(0, 60) || 'Untitled',
        instrument: 'NQ',
        direction: position === 'Short' ? 'Short' : 'Long',
        trigger: trigger,
        result: rrData.result,
        grade: grade,
        r: rrData.value,
        notes: details || monthlyNote || '',
        link: youtube || '',
        status: status,
        weeklyThesis: weeklyThesis,
        psychology: psychology,
        chartLesson: chartLesson,
        createdAt: page.created_time,
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
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

export function getWeeksOfMonth(year: number, monthIndex: number): Array<{ weekNumber: number; start: Date; end: Date }> {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  let start = new Date(firstDayOfMonth);
  while (start.getDay() !== 1) start.setDate(start.getDate() - 1);
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
      weeks.push({ weekNumber: getWeekNumber(current), start: new Date(current), end: new Date(end) });
    }
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}
