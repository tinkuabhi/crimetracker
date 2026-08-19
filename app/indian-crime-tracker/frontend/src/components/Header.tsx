import React, { useEffect, useState } from 'react';
import { LoaderCircle, Plus, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps { totalCount: number; isLive: boolean; onRefresh: () => void; onTriggerAI: () => void; onOpenAddModal: () => void; isAiLoading: boolean; dbType: string; }

export const Header: React.FC<HeaderProps> = ({ totalCount, onRefresh, onTriggerAI, onOpenAddModal, isAiLoading, dbType }) => {
  const [updatedAt, setUpdatedAt] = useState('');
  useEffect(() => { const update = () => setUpdatedAt(new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date())); update(); const timer = window.setInterval(update, 60_000); return () => window.clearInterval(timer); }, []);
  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f8f5]/90 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-teal-200 bg-teal-50 text-teal-700 shadow-sm"><ShieldCheck className="h-6 w-6" /></span><div><div className="flex items-center gap-2"><h1 className="text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">Indian Crime Tracker</h1><span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 sm:inline">Live registry</span></div><p className="mt-0.5 text-xs text-slate-500">Incident awareness and practical safety guidance</p></div></div>
      <div className="flex flex-wrap items-center gap-2"><span className="hidden text-xs text-slate-500 xl:inline">Updated {updatedAt} · {totalCount} records</span><button onClick={onRefresh} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50" title="Refresh records"><RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Refresh</span></button><button onClick={onOpenAddModal} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"><Plus className="h-4 w-4" />Add record</button><button onClick={onTriggerAI} disabled={isAiLoading} className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-700 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400">{isAiLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{isAiLoading ? 'Updating…' : 'Fetch updates'}</button></div>
    </div>
  </header>;
};
