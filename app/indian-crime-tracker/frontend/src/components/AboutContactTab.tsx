import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, FileCheck2, Mail, MapPinned, Send, ShieldCheck } from 'lucide-react';

export const AboutContactTab: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Feedback about Indian Crime Tracker', message: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'We could not send your message.');
      setStatus({ type: 'success', message: 'Thank you—your feedback has been received.' });
      setFormData({ name: '', email: '', subject: 'Feedback about Indian Crime Tracker', message: '' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'We could not send your message.' });
    } finally { setIsSubmitting(false); }
  };

  return <section className="space-y-7 pb-16">
    <div className="rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200"><ShieldCheck className="h-3.5 w-3.5 text-teal-300" /> Built for clearer public-safety awareness</span>
      <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Useful context, presented with care.</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Indian Crime Tracker brings incident records, patterns, and practical safety guidance into one place. It is a learning project and an awareness tool—not an emergency dispatch service or an official government source.</p>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><MapPinned className="h-5 w-5 text-teal-700" /><h3 className="mt-4 font-semibold text-slate-900">See the pattern</h3><p className="mt-2 text-sm leading-6 text-slate-600">Explore incident records by location, type, and severity to understand what the data is showing.</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><FileCheck2 className="h-5 w-5 text-indigo-700" /><h3 className="mt-4 font-semibold text-slate-900">Treat information carefully</h3><p className="mt-2 text-sm leading-6 text-slate-600">Records may be incomplete or evolve. Always verify urgent claims with local authorities and trusted news sources.</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><ShieldCheck className="h-5 w-5 text-rose-700" /><h3 className="mt-4 font-semibold text-slate-900">Act in an emergency</h3><p className="mt-2 text-sm leading-6 text-slate-600">For immediate police, fire, or medical help in India, call 112. Do not wait for an online report.</p></div>
    </div>

    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="rounded-2xl border border-slate-200 bg-amber-50 p-6"><Mail className="h-6 w-6 text-amber-700" /><h3 className="mt-4 text-xl font-semibold text-slate-900">Help improve the project</h3><p className="mt-3 text-sm leading-6 text-slate-600">Found a data issue, have a safety resource to suggest, or want to share feedback? Send a note. Your message is submitted to this application's backend.</p><a href="mailto:info.abhilash93@gmail.com" className="mt-5 inline-flex text-sm font-medium text-teal-700 hover:underline">info.abhilash93@gmail.com</a></aside>
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div><h3 className="text-xl font-semibold text-slate-900">Send feedback</h3><p className="mt-1 text-sm text-slate-500">Fields marked by the browser as required must be completed.</p></div>
        {status && <div className={`mt-5 flex gap-2 rounded-xl p-3 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{status.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}{status.message}</div>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Name<input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Your name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label><label className="text-sm font-medium text-slate-700">Email<input required type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label></div>
        <label className="mt-4 block text-sm font-medium text-slate-700">Subject<input required value={formData.subject} onChange={(event) => setFormData({ ...formData, subject: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label>
        <label className="mt-4 block text-sm font-medium text-slate-700">Message<textarea required rows={5} value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} placeholder="Tell us what would make this more useful…" className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label>
        <button disabled={isSubmitting} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" />{isSubmitting ? 'Sending…' : 'Send feedback'}</button>
      </form>
    </div>
  </section>;
};
