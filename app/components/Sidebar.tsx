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
  <svg viewBox="0 0 24 24" width="15" height="15"><rect x="3" y="4" width="18" height="17" rx="0"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" width="15" height="15"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const IconFile = () => (
  <svg viewBox="0 0 24 24" width="15" height="15"><rect x="3" y="4" width="18" height="17"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
);
const IconLocked = () => (
  <svg viewBox="0 0 24 24" width="15" height="15"><rect x="4" y="9" width="16" height="11"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" width="11" height="11"><polyline points="9 6 15 12 9 18"/></svg>
);

export default function Sidebar({ months }: { months: MonthItem[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});

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
    document.documentElement.style.setProperty("--sidebar-width", isOpen ? "260px" : "0px");
  }, [isOpen]);

  const toggleMonth = (key: string) => {
    setCollapsedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || (href && pathname.startsWith(href));
  };

  return (
    <>
      {/* ===== TOMBOL TOGGLE — KECIL & TRANSPARAN ===== */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 99999999,
          display: 'block',
          opacity: 0.2,
          transition: 'opacity 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.2';
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            background: '#C49A3C',
            color: '#0F0F0E',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.8)',
            transition: 'transform 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = '#C49A3C';
          }}
          aria-label="Toggle Sidebar"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* ===== SIDEBAR ===== */}
      <aside className={`sb-sidebar ${isOpen ? '' : 'collapsed'}`}>
        <div className="sb-brand">
          <span className="sb-brand-mark"></span>
          <span>EL-DOCUMENTARY</span>
        </div>

        <div className="sb-section">Tahun</div>

        <div className="sb-node open">
          <div className="sb-item">
            <span className="sb-icon"><IconFolder /></span>
            <span className="sb-label">2026</span>
            <span className="sb-chevron"><IconChevron open={true} /></span>
          </div>
          <div className="sb-children">
            {months.map((month) => {
              const monthKey = month.key;
              const isCollapsed = collapsedMonths[monthKey] !== false;
              const weeks = month.weeks || [];
              const hasWeeks = weeks.length > 0;
              const isMonthActive = isActive(`/month/${monthKey}`);

              return (
                <div key={monthKey} className="sb-node open">
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
        </div>
      </aside>
    </>
  );
}
