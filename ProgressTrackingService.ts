import { ProgressEntry, Phase, ConstructionConcept } from '../types';
import { NotificationService } from './NotificationService';

export class ProgressTrackingService {
  private static progressEntries: ProgressEntry[] = [
    {
      id: '1',
      request_id: 'req_1',
      worker_id: 'worker_1',
      uploaded_by: 'worker_1',
      timestamp: '2024-01-15T10:30:00Z',
      photo_url: 'https://example.com/progress1.jpg',
      notes: 'Foundation work started',
      quantity_completed: 25,
      estimated_total: 100,
      progress_percent: 25
    }
  ];

  private static concepts: ConstructionConcept[] = [];

  static async createProgressEntry(
    requestId: string,
    workerId: string,
    uploadedBy: string,
    photoUrl: string,
    quantityCompleted: number,
    estimatedTotal: number,
    notes?: string
  ): Promise<ProgressEntry> {
    const progressPercent = this.calculateProgressPercent(quantityCompleted, estimatedTotal);
    
    const entry: ProgressEntry = {
      id: `progress_${Date.now()}`,
      request_id: requestId,
      worker_id: workerId,
      uploaded_by: uploadedBy,
      timestamp: new Date().toISOString(),
      photo_url: photoUrl,
      notes,
      quantity_completed: quantityCompleted,
      estimated_total: estimatedTotal,
      progress_percent: progressPercent
    };

    this.progressEntries.push(entry);
    
    // Check for phase triggers
    await this.checkPhaseProgressTriggers(requestId, progressPercent);
    
    return entry;
  }

  static calculateProgressPercent(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  static async updatePhaseProgress(phaseId: string, progressPercent: number): Promise<void> {
    const concept = this.concepts.find(c => c.phases.some(p => p.id === phaseId));
    if (!concept) return;

    const phase = concept.phases.find(p => p.id === phaseId);
    if (!phase) return;

    phase.progress_percent = progressPercent;
    
    if (progressPercent === 100) {
      phase.status = 'completed';
      phase.completion_date = new Date().toISOString();
    } else if (progressPercent > 0 && phase.status === 'ready') {
      phase.status = 'in_progress';
      phase.actual_start_date = new Date().toISOString();
    }

    // Check if this progress triggers next phases
    await this.checkPhaseProgressTriggers(concept.id, progressPercent, phaseId);
  }

  static async checkPhaseProgressTriggers(
    conceptId: string, 
    progressPercent: number, 
    completedPhaseId?: string
  ): Promise<void> {
    const concept = this.concepts.find(c => c.id === conceptId);
    if (!concept) return;

    for (const phase of concept.phases) {
      if (phase.status === 'pending' && phase.start_trigger_type === 'progress_percent') {
        const triggerPercent = phase.trigger_value as number;
        
        if (progressPercent >= triggerPercent) {
          phase.status = 'ready';
          phase.estimated_start_date = new Date().toISOString();
          
          // Notify assigned crew
          if (phase.assigned_crew_id) {
            await NotificationService.sendNotification(
              phase.assigned_crew_id,
              'Phase Ready to Start',
              `Phase "${phase.title}" is now ready to begin. Previous phase reached ${triggerPercent}% completion.`,
              'phase_ready',
              phase.id,
              'phase'
            );
          }
          
          // Notify contractor
          await NotificationService.sendNotification(
            concept.contractor_id,
            'Phase Transition Complete',
            `Phase "${phase.title}" is ready to start. Crew has been notified.`,
            'phase_transition',
            phase.id,
            'phase'
          );
        }
      }
    }
  }

  static async getAssignedPhases(laborChiefId: string): Promise<(Phase & { conceptName: string })[]> {
    const assignedPhases: (Phase & { conceptName: string })[] = [];
    
    for (const concept of this.concepts) {
      for (const phase of concept.phases) {
        if (phase.assigned_crew_id === laborChiefId) {
          assignedPhases.push({
            ...phase,
            conceptName: concept.name
          });
        }
      }
    }
    
    return assignedPhases.sort((a, b) => a.order - b.order);
  }

  static async getProgressEntriesByWorker(workerId: string): Promise<ProgressEntry[]> {
    return this.progressEntries
      .filter(entry => entry.worker_id === workerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async getProgressEntriesByRequest(requestId: string): Promise<ProgressEntry[]> {
    return this.progressEntries
      .filter(entry => entry.request_id === requestId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async getLatestProgressByWorker(workerId: string): Promise<ProgressEntry | null> {
    const entries = await this.getProgressEntriesByWorker(workerId);
    return entries.length > 0 ? entries[0] : null;
  }

  static async getAllProgressEntries(): Promise<ProgressEntry[]> {
    return this.progressEntries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static async addConcept(concept: ConstructionConcept): Promise<void> {
    this.concepts.push(concept);
  }

  static async updateConcept(concept: ConstructionConcept): Promise<void> {
    const index = this.concepts.findIndex(c => c.id === concept.id);
    if (index !== -1) {
      this.concepts[index] = concept;
    }
  }
}