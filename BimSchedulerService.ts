import { ConstructionConcept, BimScheduleItem, TimelineEvent, BimObject } from '../types';

export class BimSchedulerService {
  // Get concept schedule for a site
  static async getConceptSchedule(site_id: string): Promise<BimScheduleItem[]> {
    // Mock data - replace with actual API call
    const mockSchedule: BimScheduleItem[] = [
      {
        concept_id: '1',
        concept_name: 'Foundation',
        trade: 'concrete',
        planned_start_date: '2024-01-15',
        planned_end_date: '2024-01-30',
        actual_start_date: '2024-01-16',
        progress_percent: 75,
        bim_object_ids: ['bim_001', 'bim_002'],
        status: 'in_progress'
      },
      {
        concept_id: '2',
        concept_name: 'Framing',
        trade: 'carpentry',
        planned_start_date: '2024-02-01',
        planned_end_date: '2024-02-20',
        progress_percent: 0,
        bim_object_ids: ['bim_003', 'bim_004', 'bim_005'],
        status: 'not_started'
      },
      {
        concept_id: '3',
        concept_name: 'Roofing',
        trade: 'roofing',
        planned_start_date: '2024-02-21',
        planned_end_date: '2024-03-10',
        progress_percent: 0,
        bim_object_ids: ['bim_006'],
        status: 'not_started'
      }
    ];
    
    return mockSchedule;
  }

  // Generate timeline events from concepts
  static generateTimelineFromConcepts(concepts: ConstructionConcept[]): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    concepts.forEach(concept => {
      if (concept.planned_start_date) {
        events.push({
          id: `start_${concept.id}`,
          date: concept.planned_start_date,
          concepts: [concept.name],
          type: 'start'
        });
      }
      
      if (concept.planned_end_date) {
        events.push({
          id: `end_${concept.id}`,
          date: concept.planned_end_date,
          concepts: [concept.name],
          type: 'end'
        });
      }
    });
    
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Link BIM object to concept
  static async linkBimObjectToConcept(bim_id: string, concept_id: string): Promise<boolean> {
    // Mock implementation - replace with actual API call
    console.log(`Linking BIM object ${bim_id} to concept ${concept_id}`);
    return true;
  }

  // Get BIM objects for a concept
  static async getBimObjectsForConcept(concept_id: string): Promise<BimObject[]> {
    // Mock data - replace with actual API call
    const mockObjects: BimObject[] = [
      {
        id: 'bim_001',
        name: 'Foundation Wall A',
        type: 'wall',
        properties: { material: 'concrete', thickness: 200 },
        position: { x: 0, y: 0, z: 0 },
        linked_concept_ids: [concept_id]
      }
    ];
    
    return mockObjects;
  }

  // Check for schedule delays
  static checkScheduleDelays(scheduleItems: BimScheduleItem[]): BimScheduleItem[] {
    const today = new Date();
    
    return scheduleItems.filter(item => {
      const plannedEnd = new Date(item.planned_end_date);
      const isDelayed = today > plannedEnd && item.status !== 'completed';
      
      if (isDelayed) {
        item.status = 'delayed';
      }
      
      return isDelayed;
    });
  }

  // Get today's planned tasks
  static getTodaysPlannedTasks(scheduleItems: BimScheduleItem[]): BimScheduleItem[] {
    const today = new Date().toISOString().split('T')[0];
    
    return scheduleItems.filter(item => {
      const startDate = item.planned_start_date;
      const endDate = item.planned_end_date;
      
      return today >= startDate && today <= endDate && item.status === 'in_progress';
    });
  }

  // Calculate delay days
  static calculateDelayDays(item: BimScheduleItem): number {
    if (item.status !== 'delayed') return 0;
    
    const today = new Date();
    const plannedEnd = new Date(item.planned_end_date);
    const diffTime = today.getTime() - plannedEnd.getTime();
    
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}