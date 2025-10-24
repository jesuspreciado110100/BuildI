import { NotificationService } from './NotificationService';
import { CrewRecommendation } from '../types';

export class AINotificationService {
  static async sendCrewRecommendationToContractor(
    contractorId: string,
    conceptId: string,
    recommendation: CrewRecommendation
  ): Promise<void> {
    const message = `AI suggests ${recommendation.labor_chief_name} (${recommendation.ai_rationale.split(' ')[0]} Crew) for Concept #${conceptId}`;
    
    await NotificationService.sendNotification({
      user_id: contractorId,
      title: 'AI Crew Recommendation',
      message,
      type: 'ai_recommendation',
      related_id: conceptId,
      related_type: 'concept'
    });
  }

  static async sendMatchNotificationToLaborChief(
    laborChiefId: string,
    conceptId: string,
    matchScore: number,
    tradeType: string
  ): Promise<void> {
    const message = `You're a top match (${matchScore}% score) for a new ${tradeType} trade offer`;
    
    await NotificationService.sendNotification({
      user_id: laborChiefId,
      title: 'New Trade Match',
      message,
      type: 'trade_match',
      related_id: conceptId,
      related_type: 'concept'
    });
  }

  static async sendBulkRecommendations(
    contractorId: string,
    conceptId: string,
    recommendations: CrewRecommendation[]
  ): Promise<void> {
    // Send notification to contractor
    const topCrew = recommendations[0];
    if (topCrew) {
      await this.sendCrewRecommendationToContractor(contractorId, conceptId, topCrew);
    }

    // Send notifications to top 3 labor chiefs
    const topThree = recommendations.slice(0, 3);
    for (const rec of topThree) {
      await this.sendMatchNotificationToLaborChief(
        rec.labor_chief_id,
        conceptId,
        rec.match_score,
        'foundation' // This would come from the actual concept
      );
    }
  }

  static async sendSuggestedActionNotification(
    contractorId: string,
    conceptId: string,
    action: string,
    reason: string
  ): Promise<void> {
    const message = `Suggested action: ${action} (${reason})`;
    
    await NotificationService.sendNotification({
      user_id: contractorId,
      title: 'AI Suggestion',
      message,
      type: 'ai_suggestion',
      related_id: conceptId,
      related_type: 'concept'
    });
  }

  static async sendPriorityMatchNotification(
    laborChiefId: string,
    conceptId: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<void> {
    const priorityText = priority === 'high' ? 'High Priority' : priority === 'medium' ? 'Medium Priority' : 'Low Priority';
    const message = `${priorityText}: New trade opportunity matches your expertise`;
    
    await NotificationService.sendNotification({
      user_id: laborChiefId,
      title: 'Priority Match',
      message,
      type: 'priority_match',
      related_id: conceptId,
      related_type: 'concept'
    });
  }

  static async sendCrewOptimizationComplete(
    contractorId: string,
    conceptId: string,
    totalRecommendations: number
  ): Promise<void> {
    const message = `AI analysis complete: ${totalRecommendations} crew recommendations ready for Concept #${conceptId}`;
    
    await NotificationService.sendNotification({
      user_id: contractorId,
      title: 'Crew Analysis Complete',
      message,
      type: 'optimization_complete',
      related_id: conceptId,
      related_type: 'concept'
    });
  }
}