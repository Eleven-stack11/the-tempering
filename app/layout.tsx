import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { fetchTrades } from "@/lib/notion";
import { buildTree } from "./lib/tree-builder";

export const metadata: Metadata = {
  title: "EL-Documentary — Trading Journal",
  description: "Jurnal trading yang jujur.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trades = await fetchTrades();
  const treeData = buildTree(trades);

  return (
    <html lang="id">
      <body className="bg-[#0F0F0E] text-[#E8E6E1] antialiased flex">
        <Sidebar treeData={treeData} />
        <main className="flex-1 min-h-screen p-6 transition-all duration-300 ml-64">
          {children}
        </main>
      </body>
    </html>
  );
}
