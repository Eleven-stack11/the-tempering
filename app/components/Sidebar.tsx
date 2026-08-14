'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TreeNode = {
  key: string;
  label: string;
  href?: string;
  icon?: string;
  count?: number;
  grade?: string;
  result?: string;
  children?: TreeNode[];
};

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const GradeBadge = ({ grade, result }: { grade?: string; result?: string }) => {
  let color = 'text-[#56534E] border-[#56534E]';
  if (grade === 'gold' || result === 'win') color = 'text-[#C49A3C] border-[#C49A3C]';
  else if (grade === 'rust' || result === 'loss') color = 'text-[#8B3A1F] border-[#8B3A1F]';

  return (
    <span className={`inline-block w-5 h-5 border text-[10px] font-mono font-medium flex items-center justify-center ${color}`} style={{ transform: 'rotate(45deg)' }}>
      <span style={{ transform: 'rotate(-45deg)' }}>{grade === 'gold' ? 'A' : grade === 'rust' ? 'L' : 'B'}</span>
    </span>
  );
};

const TreeItem = ({ node, level, pathname }: { node: TreeNode; level: number; pathname: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.href === pathname || (node.href && pathname.startsWith(node.href));

  useEffect(() => {
    if (hasChildren && node.children) {
      const childActive = node.children.some((child: TreeNode) =>
        child.href === pathname || (child.href && pathname.startsWith(child.href))
      );
      if (childActive) setIsOpen(true);
    }
  }, [pathname, node.children, hasChildren]);

  const toggleOpen = () => setIsOpen(!isOpen);
  const paddingLeft = 8 + level * 18;

  return (
    <div className="relative">
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#C49A3C]" style={{ left: '4px' }} />}
      <div
        className={`flex items-center py-1.5 px-2 rounded-sm cursor-pointer hover:bg-[#1A1918] transition-colors duration-200 ${
          isActive ? 'bg-[#201F1C] text-[#E8E6E1]' : 'text-[#A6A39C]'
        }`}
        style={{ paddingLeft }}
        onClick={() => hasChildren && toggleOpen()}
        role="treeitem"
        aria-expanded={hasChildren ? isOpen : undefined}
      >
        <div className="flex items-center flex-1 min-w-0 gap-2">
          <span className="text-sm font-medium truncate">{node.label}</span>
          {node.count !== undefined && node.count > 0 && (
            <span className="ml-auto text-xs text-[#6E6B65]">({node.count})</span>
          )}
          {node.grade && node.href && <GradeBadge grade={node.grade} result={node.result} />}
        </div>
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleOpen(); }}
            className="ml-2 text-[#56534E] hover:text-[#E8E6E1] transition-colors"
            aria-label="Toggle children"
          >
            <ChevronIcon open={isOpen} />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="ml-2">
          {node.children.map((child: TreeNode) => (
            <TreeItem key={child.key} node={child} level={level + 1} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar({ treeData }: { treeData: TreeNode[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#171614] border-r border-[#2C2A27] flex flex-col overflow-hidden fixed top-0 left-0 z-40">
      <div className="p-4 border-b border-[#2C2A27] flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#C49A3C] rotate-45 inline-block"></span>
        <span className="text-sm font-mono uppercase tracking-widest text-[#A6A39C]">EL-DOCUMENTARY</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin" role="tree">
        {treeData.map((node) => (
          <TreeItem key={node.key} node={node} level={0} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}
