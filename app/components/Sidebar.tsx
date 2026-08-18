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
  <svg viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="17" rx="0" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconFile = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="17" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);

const IconLocked = () =>
