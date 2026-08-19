import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Share2,
  FileText
} from 'lucide-react';
import { IncidentRecord } from '../../../shared/types';
import { getCategoryBadgeClass, formatDate } from '../utils/formatters';

interface IncidentDetailModalProps {
  incident: IncidentRecord | null;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!incident) return null;

  const badge = getCategoryBadgeClass(incident.type);

  const handleCopy = () => {
    const text = `[INDIAN CRIME TRACKER ALERT]
Date: ${incident.date}
Location: ${incident.city}, ${incident.district}, ${incident.state}
Type: ${badge.label}
Casualties: ${incident.deaths} Deaths, ${incident.injuries} Injured
Source: ${incident.source}
Summary: ${incident.description}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden text-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
              >
                {badge.label}
              </span>
              {incident.deaths > 0 && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-800">
                  💀 {incident.deaths} Fatalities
                </span>
              )}
              {incident.injuries > 0 && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
                  🩹 {incident.injuries} Injured
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-mono flex items-center gap-2 pt-1">
              <span>Incident ID: {incident._id}</span>
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs font-mono">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>GEOGRAPHIC COORDINATION</span>
            </div>
            <div className="text-sm font-bold text-slate-200">
              {incident.city}, {incident.district}
            </div>
            <div className="text-cyan-400 font-semibold">{incident.state}, India</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>TIMELINES & INGEST</span>
            </div>
            <div className="text-sm text-slate-200">
              Occurred: <span className="font-bold">{formatDate(incident.date)}</span>
            </div>
            <div className="text-slate-400">
              Fetched/Indexed: {incident.fetched_date || incident.date}
            </div>
          </div>
        </div>

        {/* Full Detailed Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>FULL VERIFIED INCIDENT REPORT</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-sm sm:text-base leading-relaxed text-slate-200">
            {incident.description}
          </div>
        </div>

        {/* Source Citation & Verification */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-mono">Verified Source Citation:</span>
            <span className="font-semibold text-slate-200">{incident.source}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-mono uppercase">
            Ground Verified
          </span>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Incident Summary</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
