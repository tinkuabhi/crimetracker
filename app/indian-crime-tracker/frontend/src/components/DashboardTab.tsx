import React, { useMemo } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Skull,
  Activity,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Flame,
  Car,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { IncidentRecord, TimeFilter } from '../../../shared/types';
import { getCategoryBadgeClass, formatDate } from '../utils/formatters';

interface DashboardTabProps {
  incidents: IncidentRecord[];
  timeFilter: TimeFilter;
  onTimeFilterChange: (tf: TimeFilter) => void;
  onSelectState: (state: string) => void;
  onSelectIncident: (inc: IncidentRecord) => void;
  onViewAllRegistry: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  road_accident: '#f59e0b', // Amber
  fire: '#f43f5e', // Rose
  cybercrime: '#06b6d4', // Cyan
  robbery: '#a855f7', // Purple
  murder: '#ef4444', // Red
  theft: '#8b5cf6', // Violet
  train_accident: '#fb923c', // Orange
  assault: '#ec4899', // Pink
  industrial_hazard: '#e11d48', // Crimson
  accident: '#eab308'
};

export const DashboardTab: React.FC<DashboardTabProps> = ({
  incidents,
  timeFilter,
  onTimeFilterChange,
  onSelectState,
  onSelectIncident,
  onViewAllRegistry
}) => {
  // Filter incidents based on time filter
  const filteredIncidents = useMemo(() => {
    const now = new Date();
    if (timeFilter === 'all') return incidents;

    return incidents.filter((item) => {
      const itemDate = new Date(item.date);
      const diffHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
      if (timeFilter === '24h') return diffHours <= 24;
      if (timeFilter === '48h') return diffHours <= 48;
      if (timeFilter === '7d') return diffHours <= 24 * 7;
      if (timeFilter === '30d') return diffHours <= 24 * 30;
      return true;
    });
  }, [incidents, timeFilter]);

  // KPI Calculations
  const totalIncidents = filteredIncidents.length;
  const totalDeaths = filteredIncidents.reduce((acc, curr) => acc + (curr.deaths || 0), 0);
  const totalInjuries = filteredIncidents.reduce((acc, curr) => acc + (curr.injuries || 0), 0);
  
  const hotspotStates = useMemo(() => {
    return Array.from(new Set(filteredIncidents.map((d) => d.state)));
  }, [filteredIncidents]);

  // Top 10 States Ranked by Incident Volume (Plot A)
  const stateVolumeData = useMemo(() => {
    const map: Record<string, { incidents: number; deaths: number; injuries: number }> = {};
    filteredIncidents.forEach((item) => {
      if (!map[item.state]) {
        map[item.state] = { incidents: 0, deaths: 0, injuries: 0 };
      }
      map[item.state].incidents += 1;
      map[item.state].deaths += item.deaths || 0;
      map[item.state].injuries += item.injuries || 0;
    });

    return Object.entries(map)
      .map(([state, stats]) => ({
        state,
        incidents: stats.incidents,
        deaths: stats.deaths,
        injuries: stats.injuries
      }))
      .sort((a, b) => b.incidents - a.incidents)
      .slice(0, 10);
  }, [filteredIncidents]);

  // Daily Fatalities & Casualties Timeline Trend (Plot B)
  const timelineTrendData = useMemo(() => {
    const map: Record<string, { deaths: number; injuries: number; incidents: number }> = {};
    filteredIncidents.forEach((item) => {
      const d = item.date;
      if (!map[d]) {
        map[d] = { deaths: 0, injuries: 0, incidents: 0 };
      }
      map[d].deaths += item.deaths || 0;
      map[d].injuries += item.injuries || 0;
      map[d].incidents += 1;
    });

    return Object.entries(map)
      .map(([date, stats]) => ({
        date: formatDate(date),
        rawDate: date,
        deaths: stats.deaths,
        injuries: stats.injuries,
        incidents: stats.incidents
      }))
      .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
  }, [filteredIncidents]);

  // Incident Category Split (Plot C)
  const categorySplitData = useMemo(() => {
    const map: Record<string, { count: number; deaths: number }> = {};
    filteredIncidents.forEach((item) => {
      const cat = item.type || 'other';
      if (!map[cat]) {
        map[cat] = { count: 0, deaths: 0 };
      }
      map[cat].count += 1;
      map[cat].deaths += item.deaths || 0;
    });

    return Object.entries(map)
      .map(([name, val]) => ({
        name: name.replace('_', ' ').toUpperCase(),
        rawType: name,
        value: val.count,
        deaths: val.deaths
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredIncidents]);

  // High alert recent incidents (Critical severity)
  const highAlertIncidents = useMemo(() => {
    return filteredIncidents
      .filter((item) => item.deaths > 0 || item.severity === 'critical')
      .slice(0, 5);
  }, [filteredIncidents]);

  return (
    <div className="legacy-ui space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. HEADER KPI SUMMARY CARDS (Top Bar)                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Total Incidents
            </span>
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold font-mono text-slate-100">
              {totalIncidents.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">In scope</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Aggregated verified records</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
        </div>

        {/* Confirmed Deaths (Crimson text / High alert styling) */}
        <div className="bg-slate-900 border border-red-900/60 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-red-700/80 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              Confirmed Deaths
            </span>
            <div className="p-2 rounded-lg bg-red-950 border border-red-800 text-red-400">
              <Skull className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold font-mono text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
              {totalDeaths.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
              High Alert
            </span>
          </div>
          <p className="mt-1 text-[11px] text-red-400/80">Fatalities recorded in timeline</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-transparent" />
        </div>

        {/* Total Injuries (Amber text) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-amber-700/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
              Total Injuries
            </span>
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold font-mono text-amber-400">
              {totalInjuries.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
              <TrendingUp className="w-3 h-3" />
              Casualties
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Hospitalized & treated victims</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-transparent" />
        </div>

        {/* Active Hotspot Regions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Hotspot States
            </span>
            <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold font-mono text-slate-100">
              {hotspotStates.length}
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              Active Zones
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Unique regional clusters reporting</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GLOBAL TIME FILTER BAR                                                 */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300 font-mono">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>GLOBAL TIME HORIZON:</span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {(
            [
              { key: 'all', label: 'All Time' },
              { key: '24h', label: 'Last 24 Hours' },
              { key: '48h', label: 'Last 48 Hours' },
              { key: '7d', label: 'Last 7 Days' },
              { key: '30d', label: 'Last 30 Days' }
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => onTimeFilterChange(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                timeFilter === item.key
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750 border border-slate-700/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE GRAPHICAL ANALYTICS GRID                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PLOT A: State-Level Incident Volume (Top 10 States Ranked) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-cyan-500 rounded-xs" />
                <h3 className="text-sm sm:text-base font-bold text-slate-200 uppercase font-mono">
                  Plot A: State Incident Volume (Top 10 Ranked)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Click bar to filter</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Ranked distribution of verified reports across Indian states with mortality overlays.
            </p>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stateVolumeData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  dataKey="state"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '12px'
                  }}
                  cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar
                  dataKey="incidents"
                  name="Incidents"
                  fill="#06b6d4"
                  radius={[0, 4, 4, 0]}
                  onClick={(data: any) => onSelectState(data.state)}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="deaths"
                  name="Fatalities (Deaths)"
                  fill="#ef4444"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PLOT C: Incident Category Split (Donut/Pie Chart) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-purple-500 rounded-xs" />
                <h3 className="text-sm sm:text-base font-bold text-slate-200 uppercase font-mono">
                  Plot C: Incident Category Split
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Proportional classification by incident nature.
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySplitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categorySplitData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.rawType] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} Incidents (${item.payload.deaths} Deaths)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800 text-[11px] font-mono">
            {categorySplitData.slice(0, 6).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300 truncate">
                  <span
                    className="w-2 h-2 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.rawType] || '#94a3b8' }}
                  />
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="text-slate-400 font-bold ml-1">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PLOT B: Daily Fatalities Trend (Deaths vs Date Timeline) */}
        <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 bg-red-500 rounded-xs" />
              <h3 className="text-sm sm:text-base font-bold text-slate-200 uppercase font-mono">
                Plot B: Timeline Trend (Daily Fatalities & Casualties)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Deaths (Fatalities)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Injuries
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Daily progression of fatalities and severe trauma casualties over the active tracking window.
          </p>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineTrendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="deathsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="injuriesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="deaths"
                  name="Deaths"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#deathsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="injuries"
                  name="Injuries"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#injuriesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. HIGH-ALERT DISPATCH FEED PREVIEW                                       */}
      {/* ========================================================================= */}
      <div className="priority-brief rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-200 uppercase font-mono">
              High-Alert Incident Ticker (Critical Ground Dispatches)
            </h3>
          </div>
          <button
            onClick={onViewAllRegistry}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>View All in Registry</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {highAlertIncidents.map((item) => {
            const badge = getCategoryBadgeClass(item.type);
            return (
              <div
                key={item._id}
                onClick={() => onSelectIncident(item)}
                className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      {item.state} • {item.district}, {item.city}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 group-hover:text-slate-100 transition">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    {item.deaths > 0 && (
                      <span className="px-2 py-0.5 rounded bg-red-950/90 text-red-400 border border-red-800 font-bold">
                        💀 {item.deaths} Fatal
                      </span>
                    )}
                    {item.injuries > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/90 text-amber-400 border border-amber-800">
                        🩹 {item.injuries} Injured
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
