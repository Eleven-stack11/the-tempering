import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Tempering — Trading Journal",
  description: "Catatan trading yang jujur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#0F0F0E] text-[#E8E6E1] antialiased">
        {children}
      </body>
    </html>
  );
}
