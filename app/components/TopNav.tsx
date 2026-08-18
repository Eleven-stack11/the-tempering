'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopNavProps {
  breadcrumb?: { label: string; href: string }[];
}

export default function TopNav({ breadcrumb = [] }: TopNavProps) {
  const pathname = usePathname();

  // Jangan tampilkan di homepage
  if (pathname === "/") return null;

  // Jika breadcrumb tidak diberikan, buat sederhana dari pathname
  let crumbs = breadcrumb;
  if (crumbs.length === 0 && pathname) {
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || 'Halaman';
    crumbs = [{ label: last, href: '#' }];
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
