import { Concept, ConceptForecast, VisualProgressLog, LogEntry } from '../types';

class ForecastService {
  private mockForecasts: ConceptForecast[] = [
    {
      id: '1',
      concept_id: '1',
      planned_progress: 60,
      actual_progress: 45,
      deviation_percentage: -15,
      is_behind_schedule: true,
      forecast_date: new Date().toISOString(),
      ai_suggested_reasons: ['Weather delays', 'Material shortage'],
      related_log_tags: ['rain', 'supply_delay'],
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      concept_id: '2',
      planned_progress: 40,
      actual_progress: 42,
      deviation_percentage: 2,
      is_behind_schedule: false,
      forecast_date: new Date().toISOString(),
      ai_suggested_reasons: ['On track'],
      related_log_tags: [],
      created_at: new Date().toISOString()
    }
  ];

  async generateForecast(concept: Concept): Promise<ConceptForecast> {
    const today = new Date();
    const startDate = concept.start_date ? new Date(concept.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = concept.end_date ? new Date(concept.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.max(0, (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const plannedProgress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    const actualProgress = concept.progress;
    const deviation = actualProgress - plannedProgress;
    
    const aiReasons = this.generateAIReasons(deviation, concept);
    const relatedTags = this.extractRelatedTags(concept.id);
    
    const forecast: ConceptForecast = {
      id: Date.now().toString(),
      concept_id: concept.id,
      planned_progress: Math.round(plannedProgress),
      actual_progress: Math.round(actualProgress),
      deviation_percentage: Math.round(deviation),
      is_behind_schedule: deviation < -10,
      forecast_date: today.toISOString(),
      ai_suggested_reasons: aiReasons,
      related_log_tags: relatedTags,
      created_at: new Date().toISOString()
    };
    
    this.mockForecasts = this.mockForecasts.filter(f => f.concept_id !== concept.id);
    this.mockForecasts.push(forecast);
    
    return forecast;
  }

  async getForecast(conceptId: string): Promise<ConceptForecast | null> {
    return this.mockForecasts.find(f => f.concept_id === conceptId) || null;
  }

  async getAllForecasts(): Promise<ConceptForecast[]> {
    return this.mockForecasts;
  }

  private generateAIReasons(deviation: number, concept: Concept): string[] {
    if (deviation >= -5) return ['On track'];
    if (deviation >= -15) return ['Minor delays', 'Weather impact'];
    if (deviation >= -25) return ['Material shortage', 'Labor shortage', 'Weather delays'];
    return ['Critical delays', 'Resource constraints', 'Weather impact', 'Quality issues'];
  }

  private extractRelatedTags(conceptId: string): string[] {
    const mockTags = ['rain', 'supply_delay', 'labor_shortage', 'equipment_failure', 'quality_check'];
    return mockTags.slice(0, Math.floor(Math.random() * 3));
  }
}

export const forecastService = new ForecastService();