import { NotificationService } from './NotificationService';
import { SafetyAnalyticsService } from './SafetyAnalyticsService';

export class SafetyNotificationService {
  private static instance: SafetyNotificationService;
  private notificationService = NotificationService.getInstance();
  private safetyService = SafetyAnalyticsService.getInstance();
  private lastScoreChecks: Map<string, number> = new Map();

  static getInstance(): SafetyNotificationService {
    if (!SafetyNotificationService.instance) {
      SafetyNotificationService.instance = new SafetyNotificationService();
    }
    return SafetyNotificationService.instance;
  }

  async checkSafetyScoreChanges(siteId: string) {
    const currentScore = await this.safetyService.calculateSafetyScore(siteId);
    const lastScore = this.lastScoreChecks.get(siteId);
    
    if (lastScore !== undefined) {
      const scoreDrop = lastScore - currentScore.score;
      
      // Significant score drop notification
      if (scoreDrop >= 20) {
        await this.notificationService.addNotification({
          id: `safety-drop-${siteId}-${Date.now()}`,
          title: `Safety Alert: Site #${siteId}`,
          message: `Safety score dropped to ${currentScore.score} (${currentScore.colorLevel === 'red' ? '🔴' : '⚠️'}) due to ${currentScore.riskReason}`,
          type: 'alert',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      
      // PPE compliance improvement
      if (currentScore.ppeCompliance >= 90 && currentScore.ppeCompliance > (lastScore * 0.9)) {
        await this.notificationService.addNotification({
          id: `ppe-improvement-${siteId}-${Date.now()}`,
          title: 'PPE Compliance Improved',
          message: `PPE compliance improved this week — ${currentScore.ppeCompliance}% ✅`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    }
    
    this.lastScoreChecks.set(siteId, currentScore.score);
  }

  async sendIncidentNotification(siteId: string, incidentType: string, severity: string) {
    const severityEmoji = severity === 'critical' ? '🚨' : severity === 'major' ? '⚠️' : '⚡';
    
    await this.notificationService.addNotification({
      id: `incident-${siteId}-${Date.now()}`,
      title: 'New Safety Incident',
      message: `${incidentType} (Severity: ${severity}) ${severityEmoji}`,
      type: 'alert',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  async sendIncidentResolutionNotification(incidentId: string, incidentType: string) {
    await this.notificationService.addNotification({
      id: `incident-resolved-${incidentId}-${Date.now()}`,
      title: 'Incident Resolved',
      message: `Incident #${incidentId} resolved: ${incidentType} contained ✅`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  async sendPPEViolationNotification(userId: string, violationType: string, siteName: string) {
    await this.notificationService.addNotification({
      id: `ppe-violation-${userId}-${Date.now()}`,
      title: 'PPE Violation Detected',
      message: `${violationType} violation detected at ${siteName} ⚠️`,
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  async sendWeeklySafetyReport(siteId: string, siteName: string, score: number, improvements: string[]) {
    const improvementsText = improvements.length > 0 
      ? `Improvements: ${improvements.join(', ')}` 
      : 'No significant changes';
    
    await this.notificationService.addNotification({
      id: `weekly-safety-${siteId}-${Date.now()}`,
      title: 'Weekly Safety Report',
      message: `${siteName} safety score: ${score}%. ${improvementsText}`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  // Simulate periodic safety monitoring
  startSafetyMonitoring(siteIds: string[]) {
    setInterval(() => {
      siteIds.forEach(siteId => {
        this.checkSafetyScoreChanges(siteId);
      });
    }, 30000); // Check every 30 seconds for demo purposes
  }
}