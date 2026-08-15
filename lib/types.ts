export interface Trade {
  id: string;
  date: string;
  title: string;
  instrument: string;
  direction: "Long" | "Short";
  trigger: string;
  result: "Win" | "Loss" | "Scratch";
  grade: "A" | "B" | "C";
  r: number;
  notes: string;
  monthlyNote: string; // <-- TAMBAHKAN INI
  link?: string;
  status?: string;
  weeklyThesis?: string;
  psychology?: string;
  chartLesson?: string;
  createdAt: string;
}
