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
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="0"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const IconFile = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
);
const IconLocked = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="9" width="16" height="11"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="9 6 15 12 9 18"/></svg>
);

const IconSidebarCollapse = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="9" y1="3" x2="9" y2="21"/>
    <path d="M15 15l-3-3 3-3"/>
  </svg>
);

const IconSidebarExpand = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="9" y1="3" x2="9" y2="21"/>
    <path d="M13 9l3 3-3 3"/>
  </svg>
);

export default function Sidebar({ months }: { months: MonthItem[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [isYearCollapsed, setIsYearCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) setIsOpen(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("sidebarOpen", String(newState));
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isOpen ? "260px" : "0px"
    );
  }, [isOpen]);

  const toggleMonth = (key: string) => {
    setCollapsedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleYear = () => {
    setIsYearCollapsed(!isYearCollapsed);
  };

  const isActive = (href: string) => pathname === href || (href && pathname?.startsWith(href));

  return (
    <>
      {/* ===== AREA HOVER KIRI ATAS (Saat Sidebar Tertutup) ===== */}
      {!isOpen && (
        <div 
          className="fixed top-0 left-0 w-20 h-20 z-[99999] flex items-start justify-start p-4 group pointer-events-auto"
        >
          <button
            onClick={toggleSidebar}
            aria-label="Open Sidebar"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#141413] border border-[#2a2a28] text-[#cba358] rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer shadow-2xl hover:border-[#cba358] hover:bg-[#1e1e1c]"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.6)' }}
          >
            <IconSidebarExpand />
          </button>
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`sb-sidebar ${isOpen ? '' : 'collapsed'}`}>
        <div 
          className="sb-brand" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%',
            paddingRight: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sb-brand-mark"></span>
            <span>EL-DOCUMENTARY</span>
          </div>

          {isOpen && (
            <button
              onClick={toggleSidebar}
              aria-label="Close Sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888888',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: 'none',
                width: '28px',
                height: '28px',
                minWidth: '28px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#cba358';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#888888';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <IconSidebarCollapse />
            </button>
          )}
        </div>

        <div className="sb-section">Tahun</div>

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
