import React, { useState } from 'react';
import { Car, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Flame, Home, Laptop, PhoneCall, ShieldAlert, ShoppingBag } from 'lucide-react';
import { SafetyTip } from '../../../shared/types';
import { SAFETY_TIPS_DATA } from '../../../shared/data/mockData';

const categories = [
  { key: 'all', label: 'All guidance' },
  { key: 'road', label: 'Road & travel' },
  { key: 'public', label: 'Public safety' },
  { key: 'cyber', label: 'Cyber safety' },
  { key: 'home', label: 'Home & fire' }
] as const;

const resources = [
  { label: 'Emergency Response Support System', href: 'https://112.gov.in/' },
  { label: 'National Cybercrime Reporting Portal', href: 'https://cybercrime.gov.in/' },
  { label: 'Road safety information', href: 'https://morth.nic.in/' }
];

export const SafetyAdviserTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]['key']>('all');
  const [expandedTip, setExpandedTip] = useState<string | null>('tip-road-05');
  const tips = activeCategory === 'all' ? SAFETY_TIPS_DATA : SAFETY_TIPS_DATA.filter((tip) => tip.category === activeCategory);

  const iconFor = (category: SafetyTip['category']) => {
    const common = 'h-5 w-5';
    if (category === 'road') return <Car className={`${common} text-orange-600`} />;
    if (category === 'public') return <ShoppingBag className={`${common} text-teal-700`} />;
    if (category === 'cyber') return <Laptop className={`${common} text-indigo-600`} />;
    return <Home className={`${common} text-rose-600`} />;
  };

  return (
    <section className="space-y-7 pb-16">
      <div className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-teal-50 p-6 sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"><ShieldAlert className="h-3.5 w-3.5" /> Practical guidance for everyday moments</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Safety advice, without the noise.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Clear first actions for road incidents, public safety, cyber fraud, and home emergencies. For an immediate danger, call 112.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
        <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg shadow-slate-200">
          <div className="flex items-center gap-2 text-sm font-semibold"><PhoneCall className="h-5 w-5 text-amber-300" /> Need urgent help?</div>
          <a href="tel:112" className="mt-5 flex items-baseline gap-3"><span className="text-5xl font-semibold tracking-tight">112</span><span className="text-sm text-slate-300">Emergency response</span></a>
          <p className="mt-3 text-sm leading-6 text-slate-300">For police, fire, or medical emergencies anywhere in India. Share your location, the nature of the emergency, and how many people need help.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a href="tel:1930" className="group rounded-2xl border border-indigo-100 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"><span className="text-sm font-semibold text-indigo-700">Financial cyber fraud</span><p className="mt-2 text-3xl font-semibold text-slate-900">1930</p><p className="mt-2 text-sm text-slate-500">Call immediately, then complete a report online.</p></a>
          <a href="tel:1033" className="group rounded-2xl border border-orange-100 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"><span className="text-sm font-semibold text-orange-700">Highway emergency</span><p className="mt-2 text-3xl font-semibold text-slate-900">1033</p><p className="mt-2 text-sm text-slate-500">Help and information for National Highways.</p></a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Filter safety advice">
        {categories.map((category) => <button key={category.key} onClick={() => setActiveCategory(category.key)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeCategory === category.key ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{category.label}</button>)}
      </div>

      <div className="grid gap-3">
        {tips.map((tip) => {
          const isOpen = expandedTip === tip.id;
          return <article key={tip.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">
            <button onClick={() => setExpandedTip(isOpen ? null : tip.id)} className="flex w-full items-start gap-4 p-5 text-left sm:items-center sm:p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-50">{iconFor(tip.category)}</span>
              <span className="min-w-0 flex-1"><span className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">{tip.category}</span><span className="mt-1 block text-base font-semibold text-slate-900">{tip.title}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{tip.description}</span></span>
              {isOpen ? <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-slate-500" /> : <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-slate-500" />}
            </button>
            {isOpen && <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
              <h3 className="text-sm font-semibold text-slate-900">What to do</h3>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">{tip.actionPoints.map((point, index) => <li key={point} className="flex gap-3 rounded-xl bg-white p-3.5 text-sm leading-6 text-slate-600 ring-1 ring-slate-100"><span className="font-semibold text-teal-700">{index + 1}</span>{point}</li>)}</ol>
              <div className="mt-4 flex flex-wrap items-center gap-2">{tip.helplines.map((line) => <span key={`${line.name}-${line.number}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"><span className="text-slate-400">{line.name}: </span>{line.number}</span>)}</div>
            </div>}
          </article>;
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><Flame className="h-5 w-5 text-rose-600" /><h3 className="font-semibold text-slate-900">Official information</h3></div><p className="mt-2 text-sm leading-6 text-slate-600">These reminders are educational, not a replacement for trained responders or local authority instructions. In a life-threatening situation, call 112.</p><div className="mt-4 flex flex-wrap gap-3">{resources.map((resource) => <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 hover:underline">{resource.label}<ExternalLink className="h-3.5 w-3.5" /></a>)}</div></div>
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 sm:p-6"><div className="flex items-center gap-2"><Laptop className="h-5 w-5 text-indigo-700" /><h3 className="font-semibold text-slate-900">If you need to report cyber fraud</h3></div><p className="mt-2 text-sm leading-6 text-slate-600">Before calling 1930 or submitting a report, keep these details together. It makes the report clearer and helps you avoid losing important evidence.</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-xl bg-white p-3 text-sm text-slate-600 ring-1 ring-indigo-100"><CheckCircle2 className="mr-2 inline h-4 w-4 text-indigo-600" />Transaction ID / UTR, date, time, amount, and bank or wallet.</div><div className="rounded-xl bg-white p-3 text-sm text-slate-600 ring-1 ring-indigo-100"><CheckCircle2 className="mr-2 inline h-4 w-4 text-indigo-600" />Screenshots, suspected phone numbers, links, handles, emails, and call recordings.</div></div><a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:underline">Open the National Cybercrime Reporting Portal <ExternalLink className="h-3.5 w-3.5" /></a></div>
    </section>
  );
};
