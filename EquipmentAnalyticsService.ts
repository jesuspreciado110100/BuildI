import { EquipmentAnalytics, DailyUsage, MachineryItem, BookingRequest } from '../types';

export class EquipmentAnalyticsService {
  private static instance: EquipmentAnalyticsService;

  static getInstance(): EquipmentAnalyticsService {
    if (!EquipmentAnalyticsService.instance) {
      EquipmentAnalyticsService.instance = new EquipmentAnalyticsService();
    }
    return EquipmentAnalyticsService.instance;
  }

  async getUtilizationStats(machinery_id: string): Promise<EquipmentAnalytics> {
    // Simulate API call to get booking logs and usage data
    const mockBookingLogs = this.generateMockBookingLogs(machinery_id);
    const mockUsageData = this.generateMockUsageData();
    
    return this.calculateAnalytics(machinery_id, mockBookingLogs, mockUsageData);
  }

  private calculateAnalytics(
    machinery_id: string,
    bookingLogs: BookingRequest[],
    usageData: DailyUsage[]
  ): EquipmentAnalytics {
    const totalHours = usageData.reduce((sum, day) => sum + day.active_hours + day.idle_hours, 0);
    const activeHours = usageData.reduce((sum, day) => sum + day.active_hours, 0);
    const idleHours = usageData.reduce((sum, day) => sum + day.idle_hours, 0);
    
    const utilizationScore = totalHours > 0 ? Math.round((activeHours / totalHours) * 100) : 0;
    const avgDailyUse = activeHours / usageData.length;
    const avgIdleTime = idleHours / usageData.length;
    
    const utilizationLevel = this.getUtilizationLevel(utilizationScore);
    const downtime_risk = this.calculateDowntimeRisk(utilizationScore, avgDailyUse);
    const maintenance_suggestion = utilizationScore > 80;
    const alert_level = this.getAlertLevel(utilizationScore, downtime_risk);
    
    return {
      machinery_id,
      machinery_name: `Equipment ${machinery_id}`,
      daily_usage_hours: Math.round(avgDailyUse * 10) / 10,
      avg_idle_time: Math.round(avgIdleTime * 10) / 10,
      utilization_score: utilizationScore,
      utilization_level: utilizationLevel,
      predicted_downtime_date: this.calculatePredictedDowntime(utilizationScore),
      last_maintenance_date: '2024-01-15',
      downtime_risk,
      maintenance_suggestion,
      usage_history: usageData,
      alert_level
    };
  }

  private getUtilizationLevel(score: number): 'high' | 'normal' | 'low' {
    if (score >= 70) return 'high';
    if (score >= 40) return 'normal';
    return 'low';
  }

  private calculateDowntimeRisk(utilizationScore: number, avgDailyUse: number): 'low' | 'medium' | 'high' {
    if (utilizationScore > 85 || avgDailyUse > 10) return 'high';
    if (utilizationScore > 70 || avgDailyUse > 8) return 'medium';
    return 'low';
  }

  private getAlertLevel(utilizationScore: number, downtime_risk: string): 'none' | 'warning' | 'critical' {
    if (downtime_risk === 'high' || utilizationScore > 85) return 'critical';
    if (downtime_risk === 'medium' || utilizationScore < 25) return 'warning';
    return 'none';
  }

  private calculatePredictedDowntime(utilizationScore: number): string | undefined {
    if (utilizationScore > 80) {
      const daysUntilDowntime = Math.floor(Math.random() * 7) + 1;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysUntilDowntime);
      return futureDate.toISOString().split('T')[0];
    }
    return undefined;
  }

  private generateMockBookingLogs(machinery_id: string): BookingRequest[] {
    return [
      {
        id: '1',
        contractor_id: 'contractor1',
        machinery_type: 'Excavator',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        location: 'Site A',
        status: 'completed',
        daily_usage_hours: 8.5,
        avg_idle_time: 2.5,
        utilization_score: 77
      }
    ];
  }

  private generateMockUsageData(): DailyUsage[] {
    const data: DailyUsage[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const activeHours = Math.random() * 8 + 2; // 2-10 hours
      const idleHours = Math.random() * 4 + 1; // 1-5 hours
      const totalHours = activeHours + idleHours;
      
      data.push({
        date: date.toISOString().split('T')[0],
        active_hours: Math.round(activeHours * 10) / 10,
        idle_hours: Math.round(idleHours * 10) / 10,
        utilization_percentage: Math.round((activeHours / totalHours) * 100)
      });
    }
    
    return data;
  }

  async getAllEquipmentAnalytics(): Promise<EquipmentAnalytics[]> {
    const mockMachinery = ['EX001', 'LD002', 'BH003', 'CR004'];
    const analytics = await Promise.all(
      mockMachinery.map(id => this.getUtilizationStats(id))
    );
    return analytics;
  }

  async getEquipmentNotifications(): Promise<string[]> {
    const analytics = await this.getAllEquipmentAnalytics();
    const notifications: string[] = [];
    
    analytics.forEach(equipment => {
      if (equipment.utilization_score < 25) {
        notifications.push(
          `${equipment.machinery_name} underused this week (utilization: ${equipment.utilization_score}%)`
        );
      }
      
      if (equipment.predicted_downtime_date) {
        const daysUntil = Math.ceil(
          (new Date(equipment.predicted_downtime_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        notifications.push(
          `Predicted downtime in ${daysUntil} days — suggest oil service for ${equipment.machinery_name}`
        );
      }
      
      if (equipment.avg_idle_time > 4) {
        notifications.push(
          `${equipment.machinery_name} has high idle time (>${Math.round(equipment.avg_idle_time)}h avg)`
        );
      }
    });
    
    return notifications;
  }
}