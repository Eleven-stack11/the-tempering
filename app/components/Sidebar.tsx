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

  // Load state dari localStorage agar ingat preferensi user
  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) setIsOpen(saved === "true");
  }, []);

  const toggle = () => {
    setIsOpen(!isOpen);
    localStorage.setItem("sidebarOpen", String(!isOpen));
  };

  return (
    <aside
      className={`transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-16"
      } bg-[#151515] border-r border-[#2a2a2a] flex-shrink-0 min-h-screen p-4 relative`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {isOpen ? (
          <span className="font-mono text-sm text-[#aaa] uppercase tracking-widest">
            EL-DOCUMENTARY
          </span>
        ) : (
          <span className="font-mono text-sm text-[#aaa] uppercase">EL</span>
        )}
        <button
          onClick={toggle}
          className="text-[#888] hover:text-white transition text-lg focus:outline-none"
        >
          {isOpen ? "◀" : "☰"}
        </button>
      </div>

      {/* Daftar Bulan */}
      <nav>
        {isOpen && (
          <h3 className="text-xs font-mono text-[#666] uppercase tracking-wider mb-3">
            Bulan
          </h3>
        )}
        <div className="space-y-1">
          {months.map(({ key, name, year, count }) => (
            <Link
              key={key}
              href={`/month/${key}`}
              className="block py-1.5 px-3 rounded hover:bg-[#2a2a2a] text-[#aaa] hover:text-white transition text-sm truncate"
              title={isOpen ? `${name} ${year} (${count})` : `${year}`}
            >
              {isOpen ? `${name} ${year} (${count})` : `${year}`}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
