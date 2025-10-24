import { Concept, Milestone } from '../types';

export class TimelineService {
  private static mockMilestones: Milestone[] = [
    {
      id: '1',
      title: 'Foundation Complete',
      date: '2024-02-15',
      description: 'All foundation work finished',
      linked_concept_ids: ['1', '2'],
      site_id: 'site1',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Framing Start',
      date: '2024-03-01',
      description: 'Begin structural framing',
      linked_concept_ids: ['3'],
      site_id: 'site1',
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  static getMilestones(siteId: string): Milestone[] {
    return this.mockMilestones.filter(m => m.site_id === siteId);
  }

  static addMilestone(milestone: Omit<Milestone, 'id' | 'created_at'>): Milestone {
    const newMilestone: Milestone = {
      ...milestone,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    this.mockMilestones.push(newMilestone);
    return newMilestone;
  }

  static updateMilestone(id: string, updates: Partial<Milestone>): Milestone | null {
    const index = this.mockMilestones.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    this.mockMilestones[index] = { ...this.mockMilestones[index], ...updates };
    return this.mockMilestones[index];
  }

  static deleteMilestone(id: string): boolean {
    const index = this.mockMilestones.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    this.mockMilestones.splice(index, 1);
    return true;
  }

  static getTimelineData(concepts: Concept[], siteId: string) {
    const milestones = this.getMilestones(siteId);
    
    // Calculate timeline bounds
    const dates = [
      ...concepts.map(c => c.start_date).filter(Boolean),
      ...concepts.map(c => c.end_date).filter(Boolean),
      ...milestones.map(m => m.date)
    ];
    
    const minDate = new Date(Math.min(...dates.map(d => new Date(d!).getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => new Date(d!).getTime())));
    
    return {
      concepts: concepts.filter(c => c.start_date && c.end_date),
      milestones,
      minDate,
      maxDate
    };
  }

  static isConceptBehindSchedule(concept: Concept): boolean {
    if (!concept.end_date) return false;
    
    const today = new Date();
    const endDate = new Date(concept.end_date);
    const startDate = new Date(concept.start_date || concept.created_at);
    
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const expectedProgress = Math.min(100, (daysPassed / totalDays) * 100);
    
    return concept.progress < expectedProgress - 10;
  }

  static getProgressColor(progress: number): string {
    if (progress >= 100) return '#10B981'; // green
    if (progress >= 75) return '#F59E0B'; // yellow
    if (progress >= 50) return '#EF4444'; // red
    return '#DC2626'; // dark red
  }
}