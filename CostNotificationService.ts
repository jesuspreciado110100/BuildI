import { NotificationService } from './NotificationService';
import { CostPrediction, DelaySimulation } from '../types';

class CostNotificationService {
  private notificationService = new NotificationService();

  async sendBudgetOverrunAlert(userId: string, conceptName: string, overrunPercentage: number) {
    const notification = {
      id: `budget_overrun_${Date.now()}`,
      user_id: userId,
      title: 'Budget Overrun Alert',
      message: `${conceptName} trade is trending over budget (+${overrunPercentage}%)`,
      type: 'budget_warning',
      status: 'unread' as const,
      timestamp: new Date().toISOString(),
      related_type: 'budget_overrun'
    };

    await this.notificationService.sendNotification(notification);
  }

  async sendDelayImpactAlert(userId: string, conceptName: string, delayDays: number, costImpact: number) {
    const notification = {
      id: `delay_impact_${Date.now()}`,
      user_id: userId,
      title: 'Delay Cost Impact Alert',
      message: `${conceptName} delay of ${delayDays} days may cause $${costImpact.toLocaleString()} cost overrun`,
      type: 'delay_warning',
      status: 'unread' as const,
      timestamp: new Date().toISOString(),
      related_type: 'delay_impact'
    };

    await this.notificationService.sendNotification(notification);
  }

  async sendMarginRiskWarning(userId: string, marginDrop: number, delayDays: number) {
    const notification = {
      id: `margin_risk_${Date.now()}`,
      user_id: userId,
      title: 'Margin Risk Warning',
      message: `If trade delays ${delayDays} days, margin drops ${marginDrop}%`,
      type: 'margin_warning',
      status: 'unread' as const,
      timestamp: new Date().toISOString(),
      related_type: 'margin_risk'
    };

    await this.notificationService.sendNotification(notification);
  }

  async sendCostForecastUpdate(userId: string, siteId: string, predictions: CostPrediction[]) {
    const highRiskConcepts = predictions.filter(p => p.risk_level === 'high');
    
    if (highRiskConcepts.length > 0) {
      const notification = {
        id: `cost_forecast_${Date.now()}`,
        user_id: userId,
        title: 'Cost Forecast Update',
        message: `${highRiskConcepts.length} concept(s) showing high cost risk. Review AI forecast for details.`,
        type: 'cost_forecast',
        status: 'unread' as const,
        timestamp: new Date().toISOString(),
        related_id: siteId,
        related_type: 'cost_forecast'
      };

      await this.notificationService.sendNotification(notification);
    }
  }

  async sendDelaySimulationAlert(userId: string, simulation: DelaySimulation) {
    const notification = {
      id: `delay_simulation_${Date.now()}`,
      user_id: userId,
      title: 'Delay Simulation Alert',
      message: `Simulated ${simulation.delay_days} day delay would cost $${simulation.cost_delta.toLocaleString()} with ${simulation.timeline_impact} day timeline impact`,
      type: 'delay_simulation',
      status: 'unread' as const,
      timestamp: new Date().toISOString(),
      related_id: simulation.concept_id,
      related_type: 'delay_simulation'
    };

    await this.notificationService.sendNotification(notification);
  }

  async schedulePeriodicCostReview(userId: string, siteId: string) {
    // Schedule weekly cost review notifications
    const notification = {
      id: `cost_review_${Date.now()}`,
      user_id: userId,
      title: 'Weekly Cost Review',
      message: 'Time for your weekly cost forecast review. Check for budget risks and delays.',
      type: 'cost_review',
      status: 'unread' as const,
      timestamp: new Date().toISOString(),
      related_id: siteId,
      related_type: 'cost_review'
    };

    await this.notificationService.sendNotification(notification);
  }

  async sendRiskMitigationSuggestion(userId: string, conceptId: string, suggestion: string) {
    const notification = {
      id: `risk_mitigation_${Date.now()}`,
      user_id: userId,
      title: 'Risk Mitigation Suggestion',
      message: `AI suggests: ${suggestion}`,
      type: 'risk_mitigation',
      status: 'unread' as const,
      timestamp: new Date().toISOString(),
      related_id: conceptId,
      related_type: 'risk_mitigation'
    };

    await this.notificationService.sendNotification(notification);
  }

  // Monitor cost predictions and automatically send alerts
  async monitorCostPredictions(userId: string, siteId: string) {
    try {
      const CostForecastService = (await import('./CostForecastService')).default;
      const predictions = await CostForecastService.getPredictedCost(siteId);
      
      for (const prediction of predictions) {
        // Send budget overrun alerts
        if (prediction.overrun_percentage > 12) {
          await this.sendBudgetOverrunAlert(userId, `Concept ${prediction.concept_id}`, prediction.overrun_percentage);
        }
        
        // Send risk mitigation suggestions for high-risk concepts
        if (prediction.risk_level === 'high') {
          const suggestions = [
            'Consider renegotiating material prices',
            'Review labor allocation and efficiency',
            'Implement tighter schedule controls',
            'Add contingency buffer to timeline'
          ];
          const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
          await this.sendRiskMitigationSuggestion(userId, prediction.concept_id, randomSuggestion);
        }
      }
      
      // Send overall forecast update
      await this.sendCostForecastUpdate(userId, siteId, predictions);
    } catch (error) {
      console.error('Error monitoring cost predictions:', error);
    }
  }
}

export default new CostNotificationService();