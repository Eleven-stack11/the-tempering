const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

function getRichText(page: any, propName: string): string {
  const prop = page.properties[propName];
  if (!prop) return '';
  if (prop.type === 'rich_text') {
    return prop.rich_text?.[0]?.plain_text || '';
  }
  if (prop.type === 'title') {
    return prop.title?.[0]?.plain_text || '';
  }
  return '';
}

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

// ===== HELPER: Ambil Instrumen dari Berbagai Kemungkinan Nama Properti =====
function getInstrument(page: any): string {
  // Coba beberapa kemungkinan nama properti
  const possibleNames = ['Instrument', 'Aa Instrument', 'Instrument (Select)', 'Instrumen'];
  for (const name of possibleNames) {
    const prop = page.properties[name];
    if (prop && prop.type === 'select' && prop.select?.name) {
      return prop.select.name;
    }
    if (prop && prop.type === 'rich_text' && prop.rich_text?.[0]?.plain_text) {
      return prop.rich_text[0].plain_text;
    }
  }
  // Fallback: cari property yang mengandung kata "Instrument" atau "Instrumen"
  const keys = Object.keys(page.properties);
  for (const key of keys) {
    if (key.toLowerCase().includes('instrument') || key.toLowerCase().includes('instrumen')) {
      const prop = page.properties[key];
      if (prop.type === 'select' && prop.select?.name) {
        return prop.select.name;
      }
      if (prop.type === 'rich_text' && prop.rich_text?.[0]?.plain_text) {
        return prop.rich_text[0].plain_text;
      }
    }
  }
  return 'NQ'; // fallback terakhir
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

    // ===== DEBUG: Log properti yang tersedia di Notion =====
    if (data.results && data.results.length > 0) {
      console.log("🔍 Properti tersedia:", Object.keys(data.results[0].properties).join(', '));
    }

    return data.results.map((page: any) => {
      const date = page.properties.Date?.date?.start || '';

      // === AMBIL INSTRUMEN DENGAN HELPER ===
      const instrument = getInstrument(page);
      const positionRaw = page.properties.Position?.select?.name || '';

      // RR: ambil nilai mentah
      let rrRaw = null;
      const rrProp = page.properties.RR;
      if (rrProp) {
        if (rrProp.type === 'select') rrRaw = rrProp.select?.name;
        else if (rrProp.type === 'multi_select') rrRaw = rrProp.multi_select?.[0]?.name;
        else if (rrProp.type === 'rich_text') rrRaw = rrProp.rich_text?.[0]?.plain_text;
        else if (rrProp.type === 'number') rrRaw = rrProp.number;
        else if (rrProp.type === 'title') rrRaw = rrProp.title?.[0]?.plain_text;
      }

      // === DETEKSI TRADE ===
      const hasInstrument = instrument.length > 0 && instrument !== 'NQ';
      const hasPosition = positionRaw.trim().length > 0;
      const hasRR = rrRaw !== null && rrRaw !== undefined && String(rrRaw).trim().length > 0;
      const isTrade = hasInstrument || hasPosition || hasRR;

      // === PROPERTI LAIN ===
      const praPasar = getRichText(page, 'Pra-pasar');
      const eksekusi = getRichText(page, 'Eksekusi');
      const monthlyNote = getRichText(page, 'Monthly Note');
      const weeklyThesis = getRichText(page, 'Weekly Thesis');
      const psychology = getRichText(page, 'Psikologi');
      const chartLesson = getRichText(page, 'Pelajaran Chart');

      const session = page.properties.Session?.select?.name || page.properties.Time?.select?.name || 'LONDON';
      const time = page.properties.Time?.select?.name || page.properties.Session?.select?.name || '';
      const youtubeLink = page.properties.YouTube?.url || '';
      const status = page.properties.Status?.select?.name || 'Entered';

      const halfRisk = page.properties['Half risk (if not...)']?.checkbox || false;
      const setupGrade = page.properties['Setup Grade']?.select?.name || 'B';

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
        date,
        title: `${positionRaw || instrument} ${instrument}`.trim() || 'Untitled',
        instrument: instrument,
        direction: positionRaw === 'Short' ? 'Short' : (positionRaw || 'Long'),
        trigger,
        result: rrData.result,
        grade,
        r: rrData.value,
        notes: praPasar || eksekusi || '',
        praPasar,
        eksekusi,
        monthlyNote,
        session,
        time,
        link: youtubeLink,
        status,
        weeklyThesis,
        psychology,
        chartLesson,
        isTrade,
        dailyFilter,
        h4Filter,
        h1Filter,
        m15Filter,
        m5Filter,
        m3Filter,
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
