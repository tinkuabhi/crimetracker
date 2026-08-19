import React from 'react';
import { BarChart3, BookOpenCheck, Database, Info } from 'lucide-react';

export type TabKey = 'dashboard' | 'registry' | 'safety' | 'about';
interface NavigationProps { activeTab: TabKey; onTabChange: (tab: TabKey) => void; recordCount: number; }

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, recordCount }) => {
  const tabs = [
    { id: 'dashboard' as const, label: 'Overview', icon: BarChart3 },
    { id: 'registry' as const, label: 'Incident registry', icon: Database, badge: recordCount },
    { id: 'safety' as const, label: 'Safety adviser', icon: BookOpenCheck },
    { id: 'about' as const, label: 'About & feedback', icon: Info }
  ];
  return <nav className="sticky top-[77px] z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl"><div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8"><div className="flex min-w-max gap-1 py-2">{tabs.map((tab) => { const Icon = tab.icon; const active = activeTab === tab.id; return <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${active ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Icon className="h-4 w-4" />{tab.label}{tab.badge !== undefined && <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{tab.badge}</span>}</button>; })}</div></div></nav>;
};
