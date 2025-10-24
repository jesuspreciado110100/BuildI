import { supabase } from '../lib/supabase';

export interface HeatmapEntry {
  date: string;            // YYYY-MM-DD
  snapshotCount: number;
  section?: string;        // Optional section name if concept-specific
}

export const ProgressHeatmapService = {
  async getHeatmapForSite(siteId: string): Promise<HeatmapEntry[]> {
    const { data, error } = await supabase
      .from('progress_snapshots')
      .select('created_at')
      .eq('site_id', siteId);

    if (error) {
      console.error('[Heatmap] Site fetch failed:', error.message);
      return [];
    }

    // Group snapshot counts by date (YYYY-MM-DD)
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const date = row.created_at.split('T')[0]; // Truncate time
      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts).map(([date, snapshotCount]) => ({
      date,
      snapshotCount,
    }));
  },

  async getHeatmapForConcept(conceptId: string): Promise<HeatmapEntry[]> {
    const { data, error } = await supabase
      .from('progress_snapshots')
      .select('created_at')
      .eq('concept_id', conceptId);

    if (error) {
      console.error('[Heatmap] Concept fetch failed:', error.message);
      return [];
    }

    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const date = row.created_at.split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts).map(([date, snapshotCount]) => ({
      date,
      snapshotCount,
    }));
  },
};