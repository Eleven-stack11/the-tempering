// ... (bagian awal sama)
return {
  id: page.id,
  date,
  title: details.slice(0, 60) || 'Untitled',
  instrument: 'NQ',
  direction: position === 'Short' ? 'Short' : 'Long',
  trigger,
  result: rrData.result,
  grade,
  r: rrData.value,
  notes: details || monthlyNote || '', // notes = gabungan detail + monthly note
  monthlyNote: monthlyNote, // <-- INI YANG DIPAKAI UNTUK CATATAN BULANAN
  link: youtube || '',
  status,
  weeklyThesis,
  psychology,
  chartLesson,
  createdAt: page.created_time,
};
// ...
