import { VisualProgressLog, BIMObject, Concept } from '../types';

class VisualProgressService {
  private visualProgressLogs: VisualProgressLog[] = [
    {
      id: '1',
      concept_id: '1',
      bim_object_id: 'wall_001',
      progress_percentage: 75,
      photo_urls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      notes: 'Foundation work completed, ready for next phase',
      submitted_by: 'laborchief-1',
      submitted_by_name: 'John Smith',
      created_at: '2024-01-15T10:30:00Z',
      contractor_approved: true
    },
    {
      id: '2',
      concept_id: '2',
      bim_object_id: 'beam_002',
      progress_percentage: 45,
      photo_urls: ['https://example.com/photo3.jpg'],
      notes: 'Structural work in progress, minor delays due to weather',
      submitted_by: 'laborchief-1',
      submitted_by_name: 'John Smith',
      created_at: '2024-01-16T14:20:00Z',
      contractor_approved: null
    }
  ];

  private mockBIMObjects: BIMObject[] = [
    {
      id: 'wall_001',
      guid: 'wall-guid-001',
      name: 'Foundation Wall A1',
      type: 'Wall',
      geometry: { x: 0, y: 0, z: 0, width: 10, height: 3, depth: 0.3 },
      properties: { material: 'Concrete', thickness: '300mm' },
      material: 'Concrete',
      layer: 'Foundation'
    },
    {
      id: 'beam_002',
      guid: 'beam-guid-002',
      name: 'Steel Beam B1',
      type: 'Beam',
      geometry: { x: 5, y: 0, z: 3, width: 8, height: 0.4, depth: 0.2 },
      properties: { material: 'Steel', profile: 'IPE300' },
      material: 'Steel',
      layer: 'Structure'
    },
    {
      id: 'column_003',
      guid: 'column-guid-003',
      name: 'Column C1',
      type: 'Column',
      geometry: { x: 2, y: 2, z: 0, width: 0.4, height: 4, depth: 0.4 },
      properties: { material: 'Concrete', reinforcement: 'Steel' },
      material: 'Concrete',
      layer: 'Structure'
    }
  ];

  getAllVisualProgressLogs(): VisualProgressLog[] {
    return this.visualProgressLogs;
  }

  getVisualProgressLogsByConcept(conceptId: string): VisualProgressLog[] {
    return this.visualProgressLogs.filter(log => log.concept_id === conceptId);
  }

  getVisualProgressLogsByBIMObject(bimObjectId: string): VisualProgressLog[] {
    return this.visualProgressLogs.filter(log => log.bim_object_id === bimObjectId);
  }

  createVisualProgressLog(log: Omit<VisualProgressLog, 'id' | 'created_at' | 'contractor_approved'>): VisualProgressLog {
    const newLog: VisualProgressLog = {
      ...log,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      contractor_approved: null
    };
    
    this.visualProgressLogs.unshift(newLog);
    return newLog;
  }

  updateVisualProgressLog(id: string, updates: Partial<VisualProgressLog>): VisualProgressLog | null {
    const index = this.visualProgressLogs.findIndex(log => log.id === id);
    if (index === -1) return null;
    
    this.visualProgressLogs[index] = { ...this.visualProgressLogs[index], ...updates };
    return this.visualProgressLogs[index];
  }

  deleteVisualProgressLog(id: string): boolean {
    const index = this.visualProgressLogs.findIndex(log => log.id === id);
    if (index === -1) return false;
    
    this.visualProgressLogs.splice(index, 1);
    return true;
  }

  approveVisualProgressLog(id: string, approved: boolean): VisualProgressLog | null {
    return this.updateVisualProgressLog(id, { contractor_approved: approved });
  }

  getBIMObjects(): BIMObject[] {
    return this.mockBIMObjects;
  }

  getBIMObjectById(id: string): BIMObject | null {
    return this.mockBIMObjects.find(obj => obj.id === id) || null;
  }

  getProgressSummaryByConcept(conceptId: string): { totalLogs: number; avgProgress: number; latestLog: VisualProgressLog | null } {
    const logs = this.getVisualProgressLogsByConcept(conceptId);
    const totalLogs = logs.length;
    const avgProgress = totalLogs > 0 ? logs.reduce((sum, log) => sum + log.progress_percentage, 0) / totalLogs : 0;
    const latestLog = logs.length > 0 ? logs[0] : null;
    
    return { totalLogs, avgProgress, latestLog };
  }
}

export const visualProgressService = new VisualProgressService();