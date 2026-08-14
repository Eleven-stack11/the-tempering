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

          <nav className="flex-1 overflow-y-auto scrollbar-thin">
            <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
              Bulan
            </h3>
            <div className="space-y-1">
              {months.map((month) => {
                const isCollapsed = collapsedMonths[month.key] !== false;
                const hasWeeks = month.weeks && month.weeks.length > 0;

                return (
                  <div key={month.key}>
                    <div
                      className="flex items-center justify-between py-1.5 px-3 rounded-sm cursor-pointer hover:bg-[#1A1918] text-[#A6A39C] hover:text-[#E8E6E1] transition-colors duration-200"
                      onClick={() => hasWeeks && toggleMonth(month.key)}
                    >
                      <span className="truncate text-sm">
                        {month.name} {month.year} ({month.count})
                      </span>
                      {hasWeeks && (
                        <span className="text-[#666] text-xs">
                          {isCollapsed ? "▶" : "▼"}
                        </span>
                      )}
                    </div>

                    {hasWeeks && !isCollapsed && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-[#2a2a2a] pl-2">
                        {month.weeks.map((week) => (
                          <Link
                            key={week.key}
                            href={week.href}
                            className="block py-1 px-3 rounded-sm hover:bg-[#1A1918] text-[#888] hover:text-[#E8E6E1] transition-colors duration-200 text-xs"
                          >
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
