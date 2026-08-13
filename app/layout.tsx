import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Tempering — 2026",
  description: "Jurnal trading yang jujur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Script untuk animasi blade-rule (sweep once when scrolled into view) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', () => {
                const rules = document.querySelectorAll('.blade-rule.on-scroll');
                if ('IntersectionObserver' in window && rules.length){
                  const io = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                      if (entry.isIntersecting){
                        entry.target.classList.add('lit');
                        io.unobserve(entry.target);
                      }
                    });
                  }, { threshold: 0.4 });
                  rules.forEach(r => io.observe(r));
                } else {
                  rules.forEach(r => r.classList.add('static'));
                }
              });
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
