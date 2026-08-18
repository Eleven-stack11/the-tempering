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

  const parts = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];
  let currentPath = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    currentPath += '/' + part;

    if (part === 'month') {
      if (i + 1 < parts.length) {
        const slug = parts[i + 1];
        const [year, month] = slug.split('-');
        const monthName = monthNames[month] || month;
        breadcrumbs.push({
          label: monthName,
          href: `/month/${slug}`,
        });
        i++;
      }
    } else if (part === 'week') {
      if (i + 1 < parts.length) {
        const weekNum = parts[i + 1];
        const monthSlug = breadcrumbs[breadcrumbs.length - 1]?.href.split('/').pop() || '';
        breadcrumbs.push({
          label: `Minggu ${weekNum}`,
          href: `/month/${monthSlug}/week/${weekNum}`,
        });
        i++;
      }
    } else if (part === 'day') {
      if (i + 1 < parts.length) {
        const dateStr = parts[i + 1];
        const d = new Date(dateStr);
        const dayName = dayNames[d.getDay()] || 'Hari';
        breadcrumbs.push({
          label: `${dayName} ${d.getDate()}`,
          href: `/month/${breadcrumbs[0]?.href.split('/').pop()}/week/${breadcrumbs[1]?.href.split('/').pop()}/day/${dateStr}`,
        });
        i++;
      }
    }
  }

  if (breadcrumbs.length === 0) {
    const last = parts[parts.length - 1] || 'Halaman';
    breadcrumbs.push({ label: last, href: '#' });
  }

  return (
    <nav className="topnav">
      <div className="topnav-crumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            {index > 0 && <span className="topnav-sep">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="topnav-here">{crumb.label}</span>
            ) : (
              <Link href={crumb.href}>{crumb.label}</Link>
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
