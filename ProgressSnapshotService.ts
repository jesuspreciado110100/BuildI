import { supabase } from '../lib/supabase';

// Types for Progress Snapshot Service
export interface ProgressSnapshot {
  id: string;
  site_id: string;
  concept_id: string;
  photo_url: string;
  timestamp: string;
  phase_label: string;
  progress_percentage: number;
  notes?: string;
  created_by: string;
}

export interface SnapshotEntry {
  id: string;
  conceptId: string;
  imageUrl: string;
  percentComplete: number;
  timestamp: string;
  status: 'on_track' | 'delayed' | 'critical';
  notes?: string;
  phaseLabel?: string;
}

// Mock in-memory storage
let mockSnapshots: ProgressSnapshot[] = [
  {
    id: '1',
    site_id: 'site1',
    concept_id: 'concept1',
    photo_url: 'https://via.placeholder.com/400x300/4CAF50/white?text=Foundation+25%',
    timestamp: '2024-01-15T08:00:00Z',
    phase_label: 'Foundation',
    progress_percentage: 25,
    notes: 'Foundation work progressing well',
    created_by: 'user1'
  },
  {
    id: '2',
    site_id: 'site1',
    concept_id: 'concept1',
    photo_url: 'https://via.placeholder.com/400x300/FF9800/white?text=Foundation+60%',
    timestamp: '2024-01-20T08:00:00Z',
    phase_label: 'Foundation',
    progress_percentage: 60,
    notes: 'Weather delays affecting progress',
    created_by: 'user1'
  },
  {
    id: '3',
    site_id: 'site1',
    concept_id: 'concept2',
    photo_url: 'https://via.placeholder.com/400x300/2196F3/white?text=Framing+40%',
    timestamp: '2024-01-18T08:00:00Z',
    phase_label: 'Framing',
    progress_percentage: 40,
    notes: 'Framing on schedule',
    created_by: 'user1'
  }
];

// Service functions
export const ProgressSnapshotService = {
  async getForConcept(conceptId: string): Promise<SnapshotEntry[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockSnapshots
      .filter(snapshot => snapshot.concept_id === conceptId)
      .map(snapshot => ({
        id: snapshot.id,
        conceptId: snapshot.concept_id,
        imageUrl: snapshot.photo_url,
        percentComplete: snapshot.progress_percentage,
        timestamp: snapshot.timestamp,
        status: this.tagStatus(snapshot),
        notes: snapshot.notes,
        phaseLabel: snapshot.phase_label
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async getForSite(siteId: string): Promise<SnapshotEntry[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockSnapshots
      .filter(snapshot => snapshot.site_id === siteId)
      .map(snapshot => ({
        id: snapshot.id,
        conceptId: snapshot.concept_id,
        imageUrl: snapshot.photo_url,
        percentComplete: snapshot.progress_percentage,
        timestamp: snapshot.timestamp,
        status: this.tagStatus(snapshot),
        notes: snapshot.notes,
        phaseLabel: snapshot.phase_label
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async uploadSnapshot(snapshotData: Omit<ProgressSnapshot, 'id'>): Promise<ProgressSnapshot> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newSnapshot: ProgressSnapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...snapshotData,
      timestamp: new Date().toISOString()
    };
    
    mockSnapshots.push(newSnapshot);
    return newSnapshot;
  },

  async getLatestSnapshot(conceptId: string): Promise<ProgressSnapshot | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const conceptSnapshots = mockSnapshots
      .filter(snapshot => snapshot.concept_id === conceptId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return conceptSnapshots.length > 0 ? conceptSnapshots[0] : null;
  },

  tagStatus(snapshot: ProgressSnapshot): 'on_track' | 'delayed' | 'critical' {
    const now = new Date();
    const snapshotDate = new Date(snapshot.timestamp);
    const daysSinceSnapshot = Math.floor((now.getTime() - snapshotDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Critical if no progress in 7+ days and completion < 90%
    if (daysSinceSnapshot >= 7 && snapshot.progress_percentage < 90) {
      return 'critical';
    }
    
    // Delayed if progress is below expected rate
    const expectedProgress = Math.min(90, daysSinceSnapshot * 5); // 5% per day expected
    if (snapshot.progress_percentage < expectedProgress * 0.8) {
      return 'delayed';
    }
    
    return 'on_track';
  }
};

// Legacy exports for backward compatibility
export async function getSnapshotsForConcept(conceptId: string): Promise<SnapshotEntry[]> {
  return ProgressSnapshotService.getForConcept(conceptId);
}

export async function addSnapshot(conceptId: string, snapshot: any): Promise<void> {
  await ProgressSnapshotService.uploadSnapshot({
    site_id: 'default_site',
    concept_id: conceptId,
    photo_url: snapshot.imageUrl,
    timestamp: new Date().toISOString(),
    phase_label: snapshot.phaseLabel || 'Progress Update',
    progress_percentage: snapshot.percentComplete,
    notes: snapshot.notes,
    created_by: 'current_user'
  });
}