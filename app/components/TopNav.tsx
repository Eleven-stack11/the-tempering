'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopNavProps {
  breadcrumb?: { label: string; href: string }[];
}

export default function TopNav({ breadcrumb = [] }: TopNavProps) {
  const pathname = usePathname();

  // Jika di homepage, tidak tampil
  if (pathname === '/') return null;

  // Default breadcrumb: coba ambil dari pathname
  let crumbs = breadcrumb;
  if (crumbs.length === 0 && pathname) {
    const parts = pathname.split('/').filter(Boolean);
    // Contoh: /month/2026-08/week/32/day/2026-08-13
    // Kita buat sederhana: hanya tampilkan label terakhir
    const last = parts[parts.length - 1];
    crumbs = [{ label: last || 'Halaman', href: '#' }];
  }

  return (
    <nav className="topnav">
      <div className="topnav-crumb">
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && <span className="topnav-sep">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="topnav-here">{c.label}</span>
            ) : (
              <Link href={c.href}>{c.label}</Link>
            )}
          </span>
        ))}
      </div>
      <Link href="/" className="topnav-home">
        <span>←</span> Beranda
      </Link>
    </nav>
  );
}
