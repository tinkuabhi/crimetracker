import { IncidentType } from '../../../shared/types';

export function getCategoryBadgeClass(type: IncidentType | string): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  const norm = (type || '').toLowerCase();

  switch (norm) {
    case 'murder':
    case 'assault':
    case 'violent_crime':
      return {
        bg: 'bg-red-950/70',
        text: 'text-red-400',
        border: 'border-red-800/80',
        label: 'Violent Crime'
      };
    case 'fire':
    case 'industrial_hazard':
      return {
        bg: 'bg-rose-950/70',
        text: 'text-rose-400',
        border: 'border-rose-800/80',
        label: norm === 'fire' ? 'Fire Hazard' : 'Industrial Hazard'
      };
    case 'road_accident':
    case 'accident':
      return {
        bg: 'bg-amber-950/70',
        text: 'text-amber-400',
        border: 'border-amber-800/80',
        label: 'Road Accident'
      };
    case 'train_accident':
      return {
        bg: 'bg-orange-950/70',
        text: 'text-orange-400',
        border: 'border-orange-800/80',
        label: 'Railway Hazard'
      };
    case 'cybercrime':
      return {
        bg: 'bg-cyan-950/70',
        text: 'text-cyan-400',
        border: 'border-cyan-800/80',
        label: 'Cyber Fraud'
      };
    case 'robbery':
    case 'theft':
      return {
        bg: 'bg-purple-950/70',
        text: 'text-purple-400',
        border: 'border-purple-800/80',
        label: norm === 'robbery' ? 'Armed Robbery' : 'Burglary / Theft'
      };
    default:
      return {
        bg: 'bg-slate-800/70',
        text: 'text-slate-300',
        border: 'border-slate-700',
        label: norm.replace('_', ' ').toUpperCase()
      };
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
