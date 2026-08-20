const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// ===== Helper untuk ambil teks dari berbagai tipe properti =====
function getText(page: any, propName: string): string {
  const prop = page.properties[propName];
  if (!prop) return '';

  // Rich text atau Title
  if (prop.type === 'rich_text' || prop.type === 'title') {
    const textArr = prop.rich_text || prop.title || [];
    return textArr.map((t: any) => t.plain_text).join('') || '';
  }

  // Select
  if (prop.type === 'select') {
    return prop.select?.name || '';
  }

  // Multi-select (ambil nilai pertama)
  if (prop.type === 'multi_select') {
    return prop.multi_select?.map((s: any) => s.name).join(', ') || '';
  }

  // Number → string
  if (prop.type === 'number') {
    return String(prop.number || '');
  }

  // Checkbox → string
  if (prop.type === 'checkbox') {
    return prop.checkbox ? 'Ya' : 'Tidak';
  }

  // URL
  if (prop.type === 'url') {
    return prop.url || '';
  }

  // Email, phone, dll.
  if (prop.type === 'email' || prop.type === 'phone_number') {
    return prop[prop.type] || '';
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

    // ===== LOG: Cek nilai Pra-pasar & Eksekusi =====
    if (data.results && data.results.length > 0) {
      console.log("🔍 Properti tersedia:", Object.keys(data.results[0].properties).join(', '));
      for (let i = 0; i < Math.min(data.results.length, 3); i++) {
        const page = data.results[i];
        const date = page.properties.Date?.date?.start || '?';
        const pra = getText(page, 'Pra-pasar');
        const eks = getText(page, 'Eksekusi');
        console.log(`🔍 Record ${i+1} (${date}): Pra-pasar="${pra}" | Eksekusi="${eks}"`);
      }
    }

    return data.results.map((page: any) => {
      const date = page.properties.Date?.date?.start || '';

      // === AMBIL INSTRUMEN ===
      const instrument = getText(page, 'Instrument') || getText(page, 'Aa Instrument') || 'NQ';
      const positionRaw = getText(page, 'Position');

      // === AMBIL RR ===
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

      // === PROPERTI LAIN (pakai getText) ===
      const praPasar = getText(page, 'Pra-pasar');
      const eksekusi = getText(page, 'Eksekusi');
      const monthlyNote = getText(page, 'Monthly Note');
      const weeklyThesis = getText(page, 'Weekly Thesis');
      const psychology = getText(page, 'Psikologi');
      const chartLesson = getText(page, 'Pelajaran Chart');
      const details = getText(page, 'Details') || '';

      const session = getText(page, 'Session') || getText(page, 'Time') || 'LONDON';
      const time = getText(page, 'Time') || getText(page, 'Session') || '';
      const youtubeLink = getText(page, 'YouTube') || '';
      const status = getText(page, 'Status') || 'Entered';

      const halfRisk = page.properties['Half risk (if not...)']?.checkbox || false;
      const setupGrade = getText(page, 'Setup Grade') || 'B';

      const dailyFilter = getText(page, 'Daily filter') || '';
      const h4Filter = getText(page, '4H filter') || '';
      const h1Filter = getText(page, '1H close filter') || '';
      const m15Filter = getText(page, '15M filter') || '';
      const m5Filter = getText(page, '5M filter') || '';
      const m3Filter = getText(page, '3M filter') || '';

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

      // === TITLE: gunakan details, atau position+instrument ===
      const title = details || `${positionRaw || instrument} ${instrument}`.trim() || 'Untitled';

      return {
        id: page.id,
        date,
        title,
        instrument,
        direction: positionRaw === 'Short' ? 'Short' : (positionRaw || 'Long'),
        trigger,
        result: rrData.result,
        grade,
        r: rrData.value,
        notes: praPasar || eksekusi || details || '',
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
