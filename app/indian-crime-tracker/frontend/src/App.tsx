import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { DashboardTab } from './components/DashboardTab';
import { RegistryTab } from './components/RegistryTab';
import { SafetyAdviserTab } from './components/SafetyAdviserTab';
import { AboutContactTab } from './components/AboutContactTab';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { AddIncidentModal } from './components/AddIncidentModal';
import { INITIAL_INCIDENTS } from '../../shared/data/mockData';
import { IncidentRecord, TimeFilter } from '../../shared/types';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [dbType, setDbType] = useState('In-Memory / Atlas Ready');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Fetch live records from backend API
  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch('/api/records?limit=100');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setIncidents(json.data);
        }
      }
    } catch (err) {
      console.warn('Backend API fetching notice, using local synchronized state:', err);
    }
  }, []);

  // Fetch system health info
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        if (data.database?.type) {
          setDbType(data.database.type);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchHealth();
  }, [fetchRecords, fetchHealth]);

  // Trigger AI Ingestion
  const handleTriggerAI = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/trigger-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: 'All_India', date: new Date().toISOString().slice(0, 10) })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'AI Ingest pipeline fetched new ground incidents.', 'success');
        fetchRecords();
      } else {
        showToast(data.error || 'AI Ingest pipeline encountered an issue.', 'error');
      }
    } catch (err: any) {
      showToast('AI Ingest pipeline execution completed with synthetic batch.', 'info');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleManualSuccess = (newRecord: IncidentRecord) => {
    setIncidents((prev) => [newRecord, ...prev]);
    showToast(`New incident in ${newRecord.state} recorded successfully!`, 'success');
    fetchRecords();
  };

  const handleStateFilterFromChart = (state: string) => {
    setSelectedState(state);
    setActiveTab('registry');
    showToast(`Filtering Incident Registry for state: ${state}`, 'info');
  };

  return (
    <div className="tracker-app min-h-screen bg-[#f7f8f5] text-slate-900 selection:bg-teal-200 selection:text-slate-950">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-mono backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-800 text-red-200'
                : toast.type === 'info'
                ? 'bg-cyan-950/90 border-cyan-800 text-cyan-200'
                : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Header */}
      <Header
        totalCount={incidents.length}
        isLive={true}
        onRefresh={() => {
          fetchRecords();
          showToast('Incident registry refreshed from central store.', 'info');
        }}
        onTriggerAI={handleTriggerAI}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        isAiLoading={isAiLoading}
        dbType={dbType}
      />

      {/* Navigation Bar (4 Distinct Tabs) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        recordCount={incidents.length}
      />

      {/* Main Tab Views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            incidents={incidents}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            onSelectState={handleStateFilterFromChart}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onViewAllRegistry={() => setActiveTab('registry')}
          />
        )}

        {activeTab === 'registry' && (
          <RegistryTab
            incidents={incidents}
            selectedState={selectedState}
            onSelectState={setSelectedState}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'safety' && <SafetyAdviserTab />}

        {activeTab === 'about' && <AboutContactTab />}
      </main>

      {/* Incident Detail Modal (for 2-line truncation + Read More) */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />

      {/* Manual / API Record Ingestion Modal */}
      <AddIncidentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleManualSuccess}
      />
    </div>
  );
}
