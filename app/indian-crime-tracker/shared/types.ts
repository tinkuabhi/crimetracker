export type IncidentType =
  | 'road_accident'
  | 'train_accident'
  | 'fire'
  | 'murder'
  | 'theft'
  | 'robbery'
  | 'assault'
  | 'cybercrime'
  | 'accident'
  | 'industrial_hazard';

export interface IncidentRecord {
  _id: string;
  date: string;
  fetched_date?: string;
  state: string;
  district: string;
  city: string;
  type: IncidentType | string;
  deaths: number;
  injuries: number;
  source: string;
  description: string;
  created_at?: string;
  verified?: boolean;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

export type TimeFilter = 'all' | '24h' | '48h' | '7d' | '30d';

export interface KPIStats {
  totalIncidents: number;
  totalDeaths: number;
  totalInjuries: number;
  hotspotCount: number;
  incidentGrowth: number;
  deathsGrowth: number;
  injuriesGrowth: number;
  lastUpdated: string;
}

export interface StateVolume {
  state: string;
  incidents: number;
  deaths: number;
  injuries: number;
}

export interface TrendPoint {
  date: string;
  deaths: number;
  injuries: number;
  incidents: number;
}

export interface CategorySplit {
  name: string;
  count: number;
  deaths: number;
  percentage: number;
}

export interface SafetyTip {
  id: string;
  category: 'road' | 'public' | 'cyber' | 'home';
  title: string;
  description: string;
  actionPoints: string[];
  helplines: { name: string; number: string }[];
  importance: 'critical' | 'recommended' | 'essential';
  icon: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt?: string;
}

export interface MicroserviceHealth {
  service: string;
  status: 'healthy' | 'warning' | 'degraded' | 'configured';
  latencyMs: number;
  details: string;
  endpoint: string;
}
