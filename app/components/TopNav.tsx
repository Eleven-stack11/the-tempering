'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const monthNames: Record<string, string> = {
  '01': 'Januari',
  '02': 'Februari',
  '03': 'Maret',
  '04': 'April',
  '05': 'Mei',
  '06': 'Juni',
  '07': 'Juli',
  '08': 'Agustus',
  '09': 'September',
  '10': 'Oktober',
  '11': 'November',
  '12': 'Desember',
};
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function TopNav() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  // Build breadcrumb
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let monthSlug = '';
  let weekNum = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === 'month' && i + 1 < parts.length) {
      monthSlug = parts[i + 1];
      const [year, month] = monthSlug.split('-');
      const monthName = monthNames[month] || month;
      crumbs.push({ label: monthName, href: `/month/${monthSlug}` });
      i++;
    } else if (part === 'week' && i + 1 < parts.length) {
      weekNum = parts[i + 1];
      crumbs.push({ label: `Minggu ${weekNum}`, href: `/month/${monthSlug}/week/${weekNum}` });
      i++;
    } else if (part === 'day' && i + 1 < parts.length) {
      const dateStr = parts[i + 1];
      const d = new Date(dateStr);
      const dayName = dayNames[d.getDay()] || 'Hari';
      crumbs.push({ label: `${dayName} ${d.getDate()}`, href: `/month/${monthSlug}/week/${weekNum}/day/${dateStr}` });
      i++;
    }
  }

  if (crumbs.length === 0) {
    const last = parts[parts.length - 1] || 'Halaman';
    crumbs.push({ label: last, href: '#' });
  }

  return (
    <nav className="topnav">
      <div className="topnav-crumb">
        <Link href="/" className="crumb-link">Beranda</Link>
        {crumbs.map((crumb, index) => (
          <span key={index} className="crumb-wrapper">
            <span className="sep">/</span>
            {index === crumbs.length - 1 ? (
              <span className="here">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="crumb-link">{crumb.label}</Link>
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
