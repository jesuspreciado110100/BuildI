import { NotificationService } from './NotificationService';
import { MaterialForecast } from '../types';

class MaterialNotificationService {
  private notificationService = new NotificationService();

  async sendMaterialDepletionWarning(
    userId: string,
    materialName: string,
    daysUntilDepletion: number,
    relatedConcepts: string[]
  ): Promise<void> {
    const conceptText = relatedConcepts.length > 0 
      ? ` (Concept: ${relatedConcepts[0]})` 
      : '';

    const title = `⚠️ Material Alert`;
    const message = `Material ${materialName} will run out in ${daysUntilDepletion} days${conceptText}`;
    
    await this.notificationService.sendNotification({
      id: `material_${materialName}_${Date.now()}`,
      user_id: userId,
      title,
      message,
      type: 'material_warning',
      status: 'unread',
      timestamp: new Date().toISOString(),
      related_type: 'material_forecast'
    });
  }

  async sendReorderSuggestion(
    userId: string,
    materialName: string,
    suggestedQuantity: number,
    daysUntilDepletion: number
  ): Promise<void> {
    const title = `🔄 Reorder Suggestion`;
    const message = `Suggested action: auto-reorder ${suggestedQuantity} units of ${materialName} now or adjust delivery date (${daysUntilDepletion} days remaining)`;
    
    await this.notificationService.sendNotification({
      id: `reorder_${materialName}_${Date.now()}`,
      user_id: userId,
      title,
      message,
      type: 'reorder_suggestion',
      status: 'unread',
      timestamp: new Date().toISOString(),
      related_type: 'material_reorder'
    });
  }

  async sendSupplierPrepareNotification(
    supplierId: string,
    materialName: string,
    quantity: number,
    daysUntilDepletion: number
  ): Promise<void> {
    const title = `🤖 AI Recommendation`;
    const message = `Prepare ${quantity} more tons of ${materialName} — depletion in ${daysUntilDepletion} days`;
    
    await this.notificationService.sendNotification({
      id: `supplier_prepare_${materialName}_${Date.now()}`,
      user_id: supplierId,
      title,
      message,
      type: 'supplier_recommendation',
      status: 'unread',
      timestamp: new Date().toISOString(),
      related_type: 'material_forecast'
    });
  }

  async sendBulkForecastNotifications(
    forecasts: MaterialForecast[],
    contractorId: string,
    supplierId?: string
  ): Promise<void> {
    const criticalForecasts = forecasts.filter(f => f.alert_level === 'critical' || f.alert_level === 'high');
    
    for (const forecast of criticalForecasts) {
      // Send to contractor
      await this.sendMaterialDepletionWarning(
        contractorId,
        forecast.material_name,
        forecast.days_until_depletion,
        forecast.related_concepts
      );
      
      if (forecast.reorder_suggestion) {
        await this.sendReorderSuggestion(
          contractorId,
          forecast.material_name,
          forecast.suggested_reorder_quantity,
          forecast.days_until_depletion
        );
      }
      
      // Send to supplier if provided
      if (supplierId && forecast.days_until_depletion <= 2) {
        await this.sendSupplierPrepareNotification(
          supplierId,
          forecast.material_name,
          forecast.suggested_reorder_quantity,
          forecast.days_until_depletion
        );
      }
    }
  }

  async scheduleDailyForecastCheck(
    siteId: string,
    contractorId: string,
    supplierId?: string
  ): Promise<void> {
    // This would typically be handled by a background job scheduler
    // For now, we'll simulate scheduling
    console.log(`Scheduled daily forecast check for site ${siteId}`);
    
    // In a real implementation, this would set up a recurring job
    // that calls MaterialForecastService.analyzeUsage() and sends notifications
  }
}

export default new MaterialNotificationService();