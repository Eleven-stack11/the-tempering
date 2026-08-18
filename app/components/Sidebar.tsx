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

// ===== BADGE =====
const Badge = ({ grade, result }: { grade?: string; result?: string }) => {
  let cls = 'be';
  if (grade === 'A' || grade === 'A+' || result === 'win') cls = 'win';
  else if (result === 'loss') cls = 'loss';
  return <span className={`sb-badge ${cls}`}>{grade === 'A' || grade === 'A+' ? 'A' : grade === 'B' ? 'B' : 'L'}</span>;
};

export default function Sidebar({ months }: { months: MonthItem[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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
      isOpen ? "260px" : "0px"
    );
  }, [isOpen]);

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (href: string) => pathname === href || (href && pathname?.startsWith(href));

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
        className={`fixed top-0 left-0 h-screen bg-[#0F0F0E] border-r border-[#2C2A27] transition-all duration-300 ease-in-out z-40 overflow-hidden ${
          isOpen ? "w-[260px] p-0" : "w-0 p-0"
        }`}
      >
        <div className={`${isOpen ? "block" : "hidden"} h-full flex flex-col`}>
          {/* Brand */}
          <div className="sb-brand">
            <span className="sb-brand-mark"></span>
            <span>EL-DOCUMENTARY</span>
          </div>

          {/* Section: Tahun */}
          <div className="sb-section">Tahun</div>

          {/* Tahun 2026 (hardcoded untuk sekarang) */}
          <div className="sb-node open">
            <div className="sb-item">
              <span className="sb-icon"><IconFolder /></span>
              <span className="sb-label">2026</span>
              <span className="sb-chevron"><IconChevron open={true} /></span>
            </div>
            <div className="sb-children">
              {months.map((month) => {
                const monthKey = month.key;
                const isCollapsed = collapsed[monthKey] !== false;
                const hasWeeks = month.weeks && month.weeks.length > 0;
                const isMonthActive = isActive(`/month/${monthKey}`);

                return (
                  <div key={monthKey} className="sb-node open">
                    <div
                      className={`sb-item ${isMonthActive ? 'active' : ''}`}
                      onClick={() => hasWeeks && toggleCollapse(monthKey)}
                    >
                      <span className="sb-icon"><IconCalendar /></span>
                      <span className="sb-label">{month.name}</span>
                      {hasWeeks && (
                        <span className="sb-chevron"><IconChevron open={!isCollapsed} /></span>
                      )}
                    </div>
                    {hasWeeks && !isCollapsed && (
                      <div className="sb-children">
                        {month.weeks.map((week) => {
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
        </div>
      </aside>

      <style jsx>{`
        .sb-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 18px 16px;
          border-bottom: 1px solid var(--border-soft);
          font-family: var(--mono); font-size: 11px;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-muted);
        }
        .sb-brand-mark {
          width: 6px; height: 6px;
          background: var(--gold); transform: rotate(45deg); flex-shrink: 0;
        }
        .sb-section {
          font-family: var(--mono); font-size: 10px;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--text-faint);
          padding: 16px 18px 6px;
        }
        .sb-node { margin: 0; }
        .sb-item {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 18px;
          font-size: 13px; color: var(--text-muted);
          border-left: 2px solid transparent;
          cursor: pointer;
          transition: background .15s, color .15s;
          user-select: none;
          text-decoration: none;
        }
        .sb-item:hover { background: var(--surface); color: var(--text); }
        .sb-item.active {
          background: var(--surface-2);
          color: var(--text);
          border-left-color: var(--gold);
        }
        .sb-item.active .sb-icon { color: var(--gold); }
        .sb-item.locked { opacity: .4; cursor: default; }
        .sb-item.locked:hover { background: transparent; color: var(--text-muted); }
        .sb-icon {
          width: 15px; height: 15px; flex-shrink: 0;
          display: flex; color: inherit; opacity: .75;
        }
        .sb-icon svg { width: 100%; height: 100%; stroke: currentColor; fill: none; stroke-width: 1.4; }
        .sb-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sb-chevron {
          width: 11px; height: 11px; flex-shrink: 0;
          color: var(--text-faint);
          transition: transform .2s;
        }
        .sb-chevron svg { width: 100%; height: 100%; stroke: currentColor; fill: none; stroke-width: 1.8; }
        .sb-node.open>.sb-item .sb-chevron { transform: rotate(90deg); }
        .sb-badge {
          font-family: var(--mono); font-size: 10px; font-weight: 600;
          padding: 1px 5px; border: 1px solid currentColor; flex-shrink: 0;
        }
        .sb-badge.win { color: var(--gold); }
        .sb-badge.loss { color: var(--rust); }
        .sb-badge.be { color: var(--steel); }
        .sb-children { display: none; }
        .sb-node.open>.sb-children { display: block; }
        .sb-children .sb-item { padding-left: 34px; }
        .sb-children .sb-children .sb-item { padding-left: 50px; }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: var(--steel-dim); }
      `}</style>
    </>
  );
}
