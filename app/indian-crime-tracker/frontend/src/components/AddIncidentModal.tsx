import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  AlertTriangle,
  Database,
  CheckCircle,
  FileCode,
  MapPin,
  Sparkles
} from 'lucide-react';
import { IncidentRecord } from '../../../shared/types';

interface AddIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRecord: IncidentRecord) => void;
}

export const AddIncidentModal: React.FC<AddIncidentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const todayStr = '2026-08-17';
  const [formData, setFormData] = useState({
    date: todayStr,
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hitec City',
    type: 'road_accident',
    deaths: 0,
    injuries: 2,
    source: 'Regional Police Press Bulletin',
    description: 'A heavy transport vehicle lost control near the main underpass, causing minor structural impact and two injured occupants who received emergency medical care.'
  });

  const [rawJsonMode, setRawJsonMode] = useState(false);
  const [rawJsonText, setRawJsonText] = useState(
    JSON.stringify(
      [
        {
          date: todayStr,
          state: 'Telangana',
          district: 'Hyderabad',
          city: 'Gachibowli',
          type: 'road_accident',
          deaths: 1,
          injuries: 3,
          source: 'Eenadu / Cyberabad Traffic Police',
          description: 'A collision between a commercial truck and two passenger vehicles at Outer Ring Road intersection caused 1 fatality and 3 injuries.'
        }
      ],
      null,
      2
    )
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let payload: any;
      if (rawJsonMode) {
        try {
          payload = JSON.parse(rawJsonText);
        } catch {
          throw new Error('Invalid JSON format. Please verify syntax.');
        }
      } else {
        payload = [
          {
            ...formData,
            deaths: Number(formData.deaths) || 0,
            injuries: Number(formData.injuries) || 0,
            fetched_date: todayStr
          }
        ];
      }

      const res = await fetch('/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to ingest record');
      }

      if (result.ingestedRecords && result.ingestedRecords.length > 0) {
        onSuccess(result.ingestedRecords[0]);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while ingesting record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 font-mono uppercase">
              Ingest Incident Record (API Simulator)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 font-mono">Ingest Mode:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRawJsonMode(false)}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                !rawJsonMode ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Interactive Form
            </button>
            <button
              type="button"
              onClick={() => setRawJsonMode(true)}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                rawJsonMode ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Raw JSON (ai_fetcher.py format)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {rawJsonMode ? (
            <div>
              <label className="block text-slate-400 font-mono mb-1">
                JSON Array Output from ai_fetcher.py
              </label>
              <textarea
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                rows={8}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">District / City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value, district: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="road_accident">Road Accident</option>
                    <option value="train_accident">Train Accident</option>
                    <option value="fire">Fire Hazard</option>
                    <option value="cybercrime">Cyber Crime</option>
                    <option value="murder">Murder</option>
                    <option value="robbery">Robbery</option>
                    <option value="theft">Theft</option>
                    <option value="assault">Assault</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Deaths (Fatalities)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deaths}
                    onChange={(e) => setFormData({ ...formData, deaths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-red-400 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Injured</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.injuries}
                    onChange={(e) => setFormData({ ...formData, injuries: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Source Citation</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  required
                  placeholder="e.g. Eenadu / Police Press Note"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Incident Summary</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Pushing to Backend...' : 'Push to Backend API (/records)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
