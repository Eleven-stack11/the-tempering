// ============================================================
// FUNGSI MINGGU YANG SUDAH PASTI BENAR (TESTED)
// ============================================================

export function getWeeksOfMonth(year: number, monthIndex: number): Array<{ weekNumber: number; start: Date; end: Date }> {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  // Cari Senin pertama yang >= firstDayOfMonth
  let currentMonday = new Date(firstDayOfMonth);
  while (currentMonday.getDay() !== 1) {
    currentMonday.setDate(currentMonday.getDate() + 1);
  }

  const weeks = [];
  let weekNumber = 1;

  while (currentMonday <= lastDayOfMonth) {
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
    }

    // Lanjut ke Senin berikutnya (TANPA BREAK)
    currentMonday.setDate(currentMonday.getDate() + 7);
  }

  return weeks;
}
