'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

interface MonthItem {
  key: string;
  name: string;
  year: number;
  count: number;
  weeks?: WeekItem[];
}

interface WeekItem {
  key: string;
  number: number;
  count: number;
  href: string;
}

// ---------- Ikon SVG (ditempel di dalam teks) ----------
const IconCalendar = () => (
  <svg className="w-4 h-4 inline-block mr-1.5 text-[#56534E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconFile = () => (
  <svg className="w-4 h-4 inline-block mr-1.5 text-[#56534E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
// -------------------------------------------------------

export default function Sidebar({ months }: { months: MonthItem[] }) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) setIsOpen(saved === "true");
  }, []);

  const toggle = () => {
    setIsOpen(!isOpen);
    localStorage.setItem("sidebarOpen", String(!isOpen));
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isOpen ? "256px" : "0px"
    );
  }, [isOpen]);

  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});

  const toggleMonth = (key: string) => {
    setCollapsedMonths(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
      <button
        onClick={toggle}
        className="fixed top-4 left-4 z-50 bg-[#151515] border border-[#2a2a2a] rounded-lg p-2 text-[#aaa] hover:text-white transition text-xl w-10 h-10 flex items-center justify-center"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? "◀" : "☰"}
      </button>

      <aside
        className={`fixed top-0 left-0 h-screen bg-[#151515] border-r border-[#2a2a2a] transition-all duration-300 ease-in-out z-40 overflow-hidden ${
          isOpen ? "w-64 p-4" : "w-0 p-0"
        }`}
      >
        <div className={`${isOpen ? "block" : "hidden"} h-full flex flex-col`}>
          <div className="flex items-center justify-between mb-6 pt-2">
            <span className="font-mono text-sm text-[#aaa] uppercase tracking-widest">
              EL-DOCUMENTARY
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
              Bulan
            </h3>
            <div className="space-y-1">
              {months.map((month) => {
                const isCollapsed = collapsedMonths[month.key] !== false;
                return (
                  <div key={month.key}>
                    <button
                      onClick={() => toggleMonth(month.key)}
                      className="w-full flex items-center justify-between py-1.5 px-3 rounded hover:bg-[#2a2a2a] text-[#aaa] hover:text-white transition text-sm"
                    >
                      <span>
                        <IconCalendar />
                        {month.name} {month.year} ({month.count})
                      </span>
                      <span className="text-[#666] text-xs">
                        {isCollapsed ? "▶" : "▼"}
                      </span>
                    </button>
                    {month.weeks && month.weeks.length > 0 && !isCollapsed && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-[#2a2a2a] pl-2">
                        {month.weeks.map((week) => (
                          <Link
                            key={week.key}
                            href={week.href}
                            className="block py-1 px-3 rounded hover:bg-[#2a2a2a] text-[#888] hover:text-white transition text-xs"
                          >
                            <IconFile />
                            Minggu {week.number} ({week.count})
                          </Link>
                        ))}
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
