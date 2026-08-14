'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

interface WeekItem {
  key: string;
  number: number;
  count: number;
  href: string;
}

interface MonthItem {
  key: string;
  name: string;
  year: number;
  count: number;
  weeks?: WeekItem[];
}

// ---------- Ikon SVG (garis tipis) ----------
const IconFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="0" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="0" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);

const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="0" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

// ---------- Komponen Utama ----------
export default function Sidebar({ months }: { months: MonthItem[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
      isOpen ? "272px" : "0px"
    );
  }, [isOpen]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  // Ambil tahun pertama dari data (asumsi semua bulan di tahun sama, misal 2026)
  const year = months.length > 0 ? months[0].year : 2026;

  return (
    <>
      {/* Tombol toggle untuk mobile */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 bg-[#151515] border border-[#2a2a2a] rounded-lg p-2 text-[#aaa] hover:text-white transition text-xl w-10 h-10 flex items-center justify-center md:hidden"
        aria-label="Buka menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } md:hidden`}
        onClick={closeMobile}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#0F0F0E] border-r border-[#2C2A27] transition-all duration-300 ease-in-out z-40 overflow-y-auto ${
          isOpen ? 'w-[272px] p-0' : 'w-0 p-0 overflow-hidden'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#56534E transparent' }}
      >
        <div className={`${isOpen ? 'block' : 'hidden'} h-full flex flex-col`}>
          {/* Brand */}
          <div className="flex items-center gap-2 px-6 py-5 border-b border-[#221F1C]">
            <span className="w-1.5 h-1.5 bg-[#C49A3C] rotate-45 inline-block"></span>
            <span className="font-mono text-xs text-[#A6A39C] uppercase tracking-widest">
              EL-DOCUMENTARY
            </span>
          </div>

          {/* Section: Tahun */}
          <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[#6E6B65] px-6 pt-5 pb-2">
            Tahun
          </div>

          {/* Tahun (hardcoded) */}
          <div className="tt-node open">
            <div className="flex items-center gap-2.5 px-6 py-2 cursor-pointer hover:bg-[#1A1918] text-[#A6A39C] hover:text-[#E8E6E1] transition-colors duration-200">
              <span className="w-4 h-4 text-[#56534E]"><IconFolder /></span>
              <span className="flex-1 text-sm">{year}</span>
              <span className="w-3 h-3 text-[#6E6B65] transition-transform duration-200 rotate-90"><IconChevron open={true} /></span>
            </div>

            <div className="pl-2">
              {months.map((month) => {
                const isCollapsed = collapsed[month.key] !== false;
                const hasWeeks = month.weeks && month.weeks.length > 0;

                return (
                  <div key={month.key} className="pl-4 border-l border-[#2C2A27]">
                    {/* Bulan */}
                    <div
                      className={`flex items-center gap-2.5 px-4 py-1.5 rounded-sm cursor-pointer hover:bg-[#1A1918] text-[#A6A39C] hover:text-[#E8E6E1] transition-colors duration-200 text-sm ${
                        // active state nanti bisa ditambahkan dengan pathname
                      }`}
                      onClick={() => hasWeeks && toggleCollapse(month.key)}
                    >
                      <span className="w-4 h-4 text-[#56534E]"><IconCalendar /></span>
                      <span className="flex-1 truncate">
                        {month.name} {month.year} ({month.count})
                      </span>
                      {hasWeeks && (
                        <span className={`w-3 h-3 text-[#6E6B65] transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>
                          <IconChevron open={!isCollapsed} />
                        </span>
                      )}
                    </div>

                    {/* Minggu */}
                    {hasWeeks && !isCollapsed && (
                      <div className="ml-6 pl-3 border-l border-[#2C2A27] space-y-0.5">
                        {month.weeks.map((week) => {
                          const weekKey = week.key;
                          const isWeekCollapsed = collapsed[weekKey] !== false;

                          return (
                            <div key={weekKey}>
                              <Link
                                href={week.href}
                                className="flex items-center gap-2.5 px-3 py-1 rounded-sm hover:bg-[#1A1918] text-[#888] hover:text-[#E8E6E1] transition-colors duration-200 text-xs"
                              >
                                <span className="w-4 h-4 text-[#56534E]"><IconFile /></span>
                                <span className="flex-1">Minggu {week.number} ({week.count})</span>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spacer untuk scrolling */}
          <div className="flex-1"></div>
        </div>
      </aside>

      {/* Tombol toggle sidebar (desktop) */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-[#151515] border border-[#2a2a2a] rounded-lg p-2 text-[#aaa] hover:text-white transition text-xl w-10 h-10 flex items-center justify-center hidden md:flex"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? "◀" : "☰"}
      </button>

      <style jsx>{`
        .tt-node.open > .tt-children { display: block; }
        .tt-children { display: none; }
        .tt-node.open > .tt-children { display: block; }
        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #56534E; border-radius: 0; }
      `}</style>
    </>
  );
}
