'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

interface MonthItem {
  key: string;
  name: string;
  year: number;
  count: number;
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

  return (
    <>
      {/* Tombol Toggle — selalu terlihat di pojok kiri */}
      <button
        onClick={toggle}
        className="fixed top-4 left-4 z-50 bg-[#151515] border border-[#2a2a2a] rounded p-2 text-[#aaa] hover:text-white transition text-xl w-10 h-10 flex items-center justify-center"
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
          <div className="flex items-center justify-between mb-8 pt-2">
            <span className="font-mono text-sm text-[#aaa] uppercase tracking-widest">
              EL-DOCUMENTARY
            </span>
          </div>

          {/* Daftar Bulan */}
          <nav>
            <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
              Bulan
            </h3>
            <div className="space-y-1">
              {months.map(({ key, name, year, count }) => (
                <Link
                  key={key}
                  href={`/month/${key}`}
                  className="block py-1.5 px-3 rounded hover:bg-[#2a2a2a] text-[#aaa] hover:text-white transition text-sm truncate"
                  title={`${name} ${year} (${count})`}
                >
                  {name} {year} ({count})
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
