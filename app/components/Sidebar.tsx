'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

// ---------- Tipe Data ----------
interface WeekItem {
  key: string;
  number: number;
  count: number;
  href: string;
  days?: DayItem[];
}

interface DayItem {
  key: string;
  date: number;
  href: string;
  grade?: string; // 'gold' | 'rust' | 'steel'
  result?: string; // 'win' | 'loss' | 'be'
}

interface MonthItem {
  key: string;
  name: string;
  year: number;
  count: number;
  weeks?: WeekItem[];
}

// ---------- Ikon SVG ----------
const IconFolder = () => (
  <svg className="w-4 h-4 text-[#56534E] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-4 h-4 text-[#56534E] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconFile = () => (
  <svg className="w-4 h-4 text-[#56534E] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''} text-[#56534E]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ---------- Badge Grade ----------
const GradeBadge = ({ grade, result }: { grade?: string; result?: string }) => {
  let color = 'text-[#56534E] border-[#56534E]';
  if (grade === 'gold' || result === 'win') color = 'text-[#C49A3C] border-[#C49A3C]';
  else if (grade === 'rust' || result === 'loss') color = 'text-[#8B3A1F] border-[#8B3A1F]';

  return (
    <span className={`inline-block w-5 h-5 border text-[10px] font-mono font-medium flex items-center justify-center ${color}`} style={{ transform: 'rotate(45deg)' }}>
      <span style={{ transform: 'rotate(-45deg)' }}>
        {grade === 'gold' ? 'A' : grade === 'rust' ? 'L' : 'B'}
      </span>
    </span>
  );
};

// ---------- Komponen Sidebar ----------
export default function Sidebar({ months }: { months: MonthItem[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) setIsOpen(saved === "true");
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    localStorage.setItem("sidebarOpen", String(!isOpen));
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isOpen ? "256px" : "0px"
    );
  }, [isOpen]);

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
      {/* Tombol Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-[#151515] border border-[#2a2a2a] rounded-lg p-2 text-[#aaa] hover:text-white transition text-xl w-10 h-10 flex items-center justify-center"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? "◀" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#151515] border-r border-[#2a2a2a] transition-all duration-300 ease-in-out z-40 overflow-hidden ${
          isOpen ? "w-64 p-4" : "w-0 p-0"
        }`}
      >
        <div className={`${isOpen ? "block" : "hidden"} h-full flex flex-col`}>
          {/* Brand */}
          <div className="flex items-center gap-2 mb-6 pt-2">
            <span className="w-1.5 h-1.5 bg-[#C49A3C] rotate-45 inline-block"></span>
            <span className="font-mono text-sm text-[#aaa] uppercase tracking-widest">
              EL-DOCUMENTARY
            </span>
          </div>

          {/* Daftar Bulan (dengan nested minggu) */}
          <nav className="flex-1 overflow-y-auto">
            <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
              Bulan
            </h3>
            <div className="space-y-1">
              {months.map((month) => {
                const isCollapsed = collapsed[month.key] !== false;
                const hasWeeks = month.weeks && month.weeks.length > 0;

                return (
                  <div key={month.key}>
                    {/* Bulan */}
                    <button
                      onClick={() => hasWeeks && toggleCollapse(month.key)}
                      className="w-full flex items-center gap-2 py-1.5 px-3 rounded hover:bg-[#2a2a2a] text-[#aaa] hover:text-white transition text-sm"
                    >
                      <IconCalendar />
                      <span className="flex-1 text-left truncate">
                        {month.name} {month.year} ({month.count})
                      </span>
                      {hasWeeks && <IconChevron open={!isCollapsed} />}
                    </button>

                    {/* Minggu (nested) */}
                    {hasWeeks && !isCollapsed && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-[#2a2a2a] pl-2">
                        {month.weeks.map((week) => {
                          const hasDays = week.days && week.days.length > 0;
                          return (
                            <div key={week.key}>
                              <Link
                                href={week.href}
                                className="flex items-center gap-2 py-1 px-3 rounded hover:bg-[#2a2a2a] text-[#888] hover:text-white transition text-xs"
                              >
                                <IconFile />
                                <span>Minggu {week.number} ({week.count})</span>
                              </Link>
                              {/* Hari (nested di bawah minggu) — opsional, nanti ditambahkan */}
                              {hasDays && week.days && (
                                <div className="ml-4 mt-0.5 space-y-0.5">
                                  {week.days.map((day) => (
                                    <Link
                                      key={day.key}
                                      href={day.href}
                                      className="flex items-center gap-2 py-0.5 px-3 rounded hover:bg-[#2a2a2a] text-[#666] hover:text-white transition text-xs"
                                    >
                                      <span>{day.date}</span>
                                      {day.grade && <GradeBadge grade={day.grade} result={day.result} />}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
