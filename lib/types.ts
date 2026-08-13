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
  link?: string;
  createdAt: string;
}
