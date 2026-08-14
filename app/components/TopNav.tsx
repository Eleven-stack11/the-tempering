'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  // Jangan tampilkan di homepage
  if (pathname === "/") return null;

  return (
    <div className="flex justify-end items-center py-3 px-4 border-b border-[#221F1C] mb-4">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest text-[#A6A39C] hover:text-[#C49A3C] transition-colors duration-200 flex items-center gap-1.5"
      >
        <span>←</span> Beranda
      </Link>
    </div>
  );
}
