import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { IncidentRecord } from '../../../shared/types';
import { getCategoryBadgeClass, formatDate } from '../utils/formatters';

interface RegistryTabProps {
  incidents: IncidentRecord[];
  selectedState: string;
  onSelectState: (state: string) => void;
  onSelectIncident: (inc: IncidentRecord) => void;
  onOpenAddModal: () => void;
}

export const RegistryTab: React.FC<RegistryTabProps> = ({
  incidents,
  selectedState,
  onSelectState,
  onSelectIncident,
  onOpenAddModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract unique states & categories for dropdowns
  const availableStates = useMemo(() => {
    return Array.from(new Set(incidents.map((i) => i.state))).sort();
  }, [incidents]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(incidents.map((i) => i.type))).sort();
  }, [incidents]);

  // Filtering
  const filtered = useMemo(() => {
    return incidents.filter((item) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches =
          item.description.toLowerCase().includes(term) ||
          item.state.toLowerCase().includes(term) ||
          item.district.toLowerCase().includes(term) ||
          item.city.toLowerCase().includes(term) ||
          item.source.toLowerCase().includes(term) ||
          item.type.toLowerCase().includes(term);
        if (!matches) return false;
      }

      // State
      if (selectedState && selectedState !== 'all') {
        if (item.state.toLowerCase() !== selectedState.toLowerCase()) return false;
      }

      // Category
      if (categoryFilter && categoryFilter !== 'all') {
        if (item.type.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }

      // Severity
      if (severityFilter && severityFilter !== 'all') {
        if (severityFilter === 'fatal' && item.deaths === 0) return false;
        if (severityFilter === 'injuries' && item.injuries === 0) return false;
        if (severityFilter === 'critical' && item.severity !== 'critical') return false;
      }

      return true;
    });
  }, [incidents, searchTerm, selectedState, categoryFilter, severityFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Fetched Date', 'State', 'District', 'City', 'Type', 'Deaths', 'Injuries', 'Source', 'Description'];
    const rows = filtered.map((i) => [
      `"${i._id}"`,
      `"${i.date}"`,
      `"${i.fetched_date || i.date}"`,
      `"${i.state}"`,
      `"${i.district}"`,
      `"${i.city}"`,
      `"${i.type}"`,
      i.deaths,
      i.injuries,
      `"${i.source.replace(/"/g, '""')}"`,
      `"${i.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `indian_crime_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `indian_crime_tracker_records_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="legacy-ui space-y-6 pb-12">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-mono text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Incident Database Registry</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-cyan-400 border border-slate-700">
              {filtered.length} Filtered Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter, search, audit and inspect all ground-verified regional dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            title="Download JSON"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export</span> JSON
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ingest Record</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search keywords, city, source..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-sans"
          />
        </div>

        {/* State Filter */}
        <div>
          <select
            value={selectedState}
            onChange={(e) => {
              onSelectState(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
          >
            <option value="all">All Indian States (Pan-India)</option>
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition capitalize"
          >
            <option value="all">All Incident Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
          >
            <option value="all">All Casualty Severities</option>
            <option value="fatal">Fatalities Only (Deaths &gt; 0)</option>
            <option value="injuries">Injuries Only (Injured &gt; 0)</option>
            <option value="critical">Critical High-Alert</option>
          </select>
        </div>
      </div>

      {/* Incidents Data Registry Table / Card List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {/* Table View (Desktop & Tablet) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date / Fetched</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Casualties</th>
                <th className="py-3 px-4 w-2/5">Incident Summary & Verified Source</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-sm">
                    No incident records matched your active filter criteria.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => {
                  const badge = getCategoryBadgeClass(item.type);
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{formatDate(item.date)}</div>
                        <div className="text-[10px] text-slate-500">Fetched: {item.fetched_date || item.date}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-cyan-400">{item.state}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 inline text-slate-500" />
                          {item.district}, {item.city}
                        </div>
                      </td>

                      {/* Category Tag */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Casualties */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="flex flex-col gap-1">
                          {item.deaths > 0 ? (
                            <span className="text-red-400 font-bold">
                              💀 {item.deaths} {item.deaths === 1 ? 'Death' : 'Deaths'}
                            </span>
                          ) : (
                            <span className="text-slate-500">0 Fatalities</span>
                          )}
                          {item.injuries > 0 ? (
                            <span className="text-amber-400">
                              🩹 {item.injuries} Injured
                            </span>
                          ) : (
                            <span className="text-slate-600">0 Injured</span>
                          )}
                        </div>
                      </td>

                      {/* Description with 2-Line Truncation & Source */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">
                            Source: <span className="text-slate-300 font-medium">{item.source}</span>
                          </span>
                        </div>
                      </td>

                      {/* Action Modal Trigger */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectIncident(item)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-700/60 text-xs font-semibold font-mono transition cursor-pointer"
                        >
                          [+ More Details]
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {currentItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No incidents found.
            </div>
          ) : (
            currentItems.map((item) => {
              const badge = getCategoryBadgeClass(item.type);
              return (
                <div key={item._id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.state} • {item.district}, {item.city}</span>
                  </div>

                  {/* 2-line clamped summary */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      {item.deaths > 0 && (
                        <span className="text-red-400 font-bold">💀 {item.deaths} Deaths</span>
                      )}
                      {item.injuries > 0 && (
                        <span className="text-amber-400">🩹 {item.injuries} Injured</span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectIncident(item)}
                      className="px-2 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700 text-xs font-semibold font-mono"
                    >
                      [+ More Details]
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        <div className="border-t border-slate-800 bg-slate-950/80 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Showing <span className="text-slate-200 font-bold">{filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span className="text-slate-200 font-bold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{' '}
            <span className="text-slate-200 font-bold">{filtered.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded border border-slate-800 text-slate-400 transition ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-slate-800 hover:text-slate-200 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded border border-slate-800 text-slate-400 transition ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-slate-800 hover:text-slate-200 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
