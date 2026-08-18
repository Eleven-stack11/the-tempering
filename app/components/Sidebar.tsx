'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface WeekItem {
  key: string;
  number: number;
  localNumber?: number;
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

// ===== IKON SVG =====
const IconFolder = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="0"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const IconFile = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
);
const IconLocked = () => (
  <svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="11"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
);

export default function Sidebar({ months }: { months: MonthItem[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [isYearCollapsed, setIsYearCollapsed] = useState(false);

  // Load state sidebar dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) setIsOpen(saved === "true");
  }, []);

  // Toggle sidebar (buka/tutup)
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("sidebarOpen", String(newState));
  };

  // Update CSS variable saat isOpen berubah
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isOpen ? "260px" : "0px"
    );
  }, [isOpen]);

  // Toggle collapse untuk bulan
  const toggleMonth = (key: string) => {
    setCollapsedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle collapse untuk tahun
  const toggleYear = () => {
    setIsYearCollapsed(!isYearCollapsed);
  };

  const isActive = (href: string) => pathname === href || (href && pathname?.startsWith(href));

  return (
    <>
      {/* ===== TOMBOL HAMBURGER - Muncul jika sidebar tertutup ===== */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[99999] bg-[#151515] border border-[#2a2a2a] rounded-lg text-[#aaa] hover:text-white transition text-xl flex items-center justify-center cursor-pointer"
          style={{ width: '40px', height: '40px', minWidth: '40px', pointerEvents: 'auto' }}
          aria-label="Open Sidebar"
        >
          ☰
        </button>
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`sb-sidebar ${isOpen ? '' : 'collapsed'} relative`}>
        
        {/* Tombol Tutup Sidebar - Terkunci posisi dan ukurannya di pojok kanan atas */}
        {isOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-3 z-20 text-[#aaa] hover:text-white transition text-xs rounded hover:bg-[#222] flex items-center justify-center cursor-pointer border-0"
            style={{ 
              width: '28px', 
              height: '28px', 
              minWidth: '28px', 
              maxWidth: '28px', 
              backgroundColor: 'transparent', 
              padding: 0 
            }}
            aria-label="Close Sidebar"
          >
            ◀
          </button>
        )}

        <div className="sb-brand">
          <span className="sb-brand-mark"></span>
          <span>EL-DOCUMENTARY</span>
        </div>

        <div className="sb-section">Tahun</div>

        {/* Node 2026 — dengan toggle collapse */}
        <div className={`sb-node ${isYearCollapsed ? '' : 'open'}`}>
          <div className="sb-item" onClick={toggleYear}>
            <span className="sb-icon"><IconFolder /></span>
            <span className="sb-label">2026</span>
            <span className="sb-chevron"><IconChevron open={!isYearCollapsed} /></span>
          </div>
          {!isYearCollapsed && (
            <div className="sb-children">
              {months.map((month) => {
                const monthKey = month.key;
                const isCollapsed = collapsedMonths[monthKey] !== false;
                const weeks = month.weeks || [];
                const hasWeeks = weeks.length > 0;
                const isMonthActive = isActive(`/month/${monthKey}`);

                return (
                  <div key={monthKey} className={`sb-node ${isCollapsed ? '' : 'open'}`}>
                    <div
                      className={`sb-item ${isMonthActive ? 'active' : ''}`}
                      onClick={() => hasWeeks && toggleMonth(monthKey)}
                    >
                      <span className="sb-icon"><IconCalendar /></span>
                      <span className="sb-label">{month.name}</span>
                      {hasWeeks && (
                        <span className="sb-chevron"><IconChevron open={!isCollapsed} /></span>
                      )}
                    </div>
                    {hasWeeks && !isCollapsed && (
                      <div className="sb-children">
                        {weeks.map((week) => {
                          const isWeekActive = isActive(week.href);
                          const isLocked = week.count === 0;

                          return (
                            <div key={week.key} className="sb-node">
                              <Link
                                href={week.href}
                                className={`sb-item ${isWeekActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                              >
                                <span className="sb-icon">
                                  {isLocked ? <IconLocked /> : <IconFile />}
                                </span>
                                <span className="sb-label">Minggu {week.localNumber || week.number}</span>
                                {!isLocked && week.count > 0 && (
                                  <span className="sb-badge be">{week.count}</span>
                                )}
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
          )}
        </div>
      </aside>
    </>
  );
}
