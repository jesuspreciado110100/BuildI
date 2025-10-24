import { ConstructionConcept, DelayInfo } from '../types';

export class DelayTrackerService {
  private static readonly DELAY_REASONS = [
    'Labor shortage',
    'Material delay', 
    'Weather',
    'Crew absenteeism',
    'Design change'
  ];

  static getDelayReasons(): string[] {
    return [...this.DELAY_REASONS];
  }

  static calculateDelayStatus(concept: ConstructionConcept): DelayInfo {
    const now = new Date();
    const plannedStart = concept.planned_start_date ? new Date(concept.planned_start_date) : now;
    const plannedEnd = concept.planned_end_date ? new Date(concept.planned_end_date) : 
      new Date(plannedStart.getTime() + (concept.delay_info?.planned_duration_days || concept.estimated_duration) * 24 * 60 * 60 * 1000);
    
    const plannedDuration = Math.ceil((plannedEnd.getTime() - plannedStart.getTime()) / (24 * 60 * 60 * 1000));
    
    // Calculate actual duration based on progress
    let actualDuration: number | undefined;
    let forecastedCompletion: string | undefined;
    
    if (concept.status === 'completed') {
      // Use actual completion date if available
      const completedPhases = concept.phases.filter(p => p.status === 'completed');
      if (completedPhases.length > 0) {
        const lastCompletion = completedPhases
          .map(p => p.completion_date)
          .filter(Boolean)
          .sort()
          .pop();
        if (lastCompletion) {
          actualDuration = Math.ceil((new Date(lastCompletion).getTime() - plannedStart.getTime()) / (24 * 60 * 60 * 1000));
        }
      }
    } else if (concept.status === 'in_progress') {
      // Forecast based on current progress
      const totalProgress = this.calculateOverallProgress(concept);
      if (totalProgress > 0) {
        const daysSinceStart = Math.ceil((now.getTime() - plannedStart.getTime()) / (24 * 60 * 60 * 1000));
        const projectedTotalDays = Math.ceil(daysSinceStart / (totalProgress / 100));
        forecastedCompletion = new Date(plannedStart.getTime() + projectedTotalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Check if forecasted completion is after planned end
        if (new Date(forecastedCompletion) > plannedEnd) {
          actualDuration = projectedTotalDays;
        }
      }
    }
    
    const delayDays = actualDuration ? Math.max(0, actualDuration - plannedDuration) : 0;
    const isDelayed = delayDays > 0 || (forecastedCompletion && new Date(forecastedCompletion) > plannedEnd);
    
    return {
      planned_duration_days: plannedDuration,
      actual_duration_days: actualDuration,
      delay_reason: concept.delay_info?.delay_reason || [],
      is_delayed: isDelayed,
      delay_days: delayDays || (forecastedCompletion && new Date(forecastedCompletion) > plannedEnd ? 
        Math.ceil((new Date(forecastedCompletion).getTime() - plannedEnd.getTime()) / (24 * 60 * 60 * 1000)) : 0),
      forecasted_completion: forecastedCompletion,
      recovery_actions: this.suggestRecoveryActions(concept, delayDays)
    };
  }

  private static calculateOverallProgress(concept: ConstructionConcept): number {
    if (concept.phases.length === 0) return 0;
    
    const totalProgress = concept.phases.reduce((sum, phase) => sum + phase.progress_percent, 0);
    return totalProgress / concept.phases.length;
  }

  private static suggestRecoveryActions(concept: ConstructionConcept, delayDays: number): string[] {
    const actions: string[] = [];
    
    if (delayDays > 0) {
      const delayReasons = concept.delay_info?.delay_reason || [];
      
      if (delayReasons.includes('Labor shortage')) {
        actions.push('Reassign additional labor crews');
        actions.push('Consider overtime work');
      }
      
      if (delayReasons.includes('Material delay')) {
        actions.push('Reorder materials from alternative suppliers');
        actions.push('Expedite material delivery');
      }
      
      if (delayReasons.includes('Weather')) {
        actions.push('Adjust work schedule for weather windows');
        actions.push('Consider weather-resistant alternatives');
      }
      
      if (delayReasons.includes('Crew absenteeism')) {
        actions.push('Hire temporary replacement workers');
        actions.push('Redistribute tasks among available crew');
      }
      
      if (delayReasons.includes('Design change')) {
        actions.push('Escalate to project management');
        actions.push('Fast-track design approval process');
      }
      
      if (delayDays > 7) {
        actions.push('Escalate to senior management');
        actions.push('Consider parallel work streams');
      }
    }
    
    return actions;
  }

  static updateDelayReason(conceptId: string, reasons: string[]): Promise<void> {
    // Mock implementation - would integrate with backend
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Updated delay reasons for concept ${conceptId}:`, reasons);
        resolve();
      }, 500);
    });
  }

  static getDelayedConcepts(concepts: ConstructionConcept[]): ConstructionConcept[] {
    return concepts
      .map(concept => ({
        ...concept,
        delay_info: this.calculateDelayStatus(concept)
      }))
      .filter(concept => concept.delay_info?.is_delayed)
      .sort((a, b) => (b.delay_info?.delay_days || 0) - (a.delay_info?.delay_days || 0));
  }

  static getDelayTrendsByTrade(concepts: ConstructionConcept[]): Record<string, number> {
    const tradeCounts: Record<string, { total: number, delayed: number }> = {};
    
    concepts.forEach(concept => {
      if (!tradeCounts[concept.trade]) {
        tradeCounts[concept.trade] = { total: 0, delayed: 0 };
      }
      tradeCounts[concept.trade].total++;
      
      const delayInfo = this.calculateDelayStatus(concept);
      if (delayInfo.is_delayed) {
        tradeCounts[concept.trade].delayed++;
      }
    });
    
    const trends: Record<string, number> = {};
    Object.keys(tradeCounts).forEach(trade => {
      trends[trade] = tradeCounts[trade].total > 0 ? 
        (tradeCounts[trade].delayed / tradeCounts[trade].total) * 100 : 0;
    });
    
    return trends;
  }

  static getDelayReasonDistribution(concepts: ConstructionConcept[]): Record<string, number> {
    const reasonCounts: Record<string, number> = {};
    
    concepts.forEach(concept => {
      const delayInfo = this.calculateDelayStatus(concept);
      if (delayInfo.is_delayed && delayInfo.delay_reason) {
        delayInfo.delay_reason.forEach(reason => {
          reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });
      }
    });
    
    return reasonCounts;
  }
}