import { Site, PPEViolation, SiteEntryLog } from '../types';
import { NotificationService } from './NotificationService';

export interface SafetyScoreResult {
  score: number;
  colorLevel: 'green' | 'yellow' | 'red';
  riskReason: string;
  incidentCount: number;
  resolvedIncidents: number;
  ppeCompliance: number;
  entryViolations: number;
}

export class SafetyAnalyticsService {
  private static instance: SafetyAnalyticsService;
  private notificationService = NotificationService.getInstance();
  
  // Mock data for incidents
  private mockIncidents = [
    { id: '1', site_id: '1', severity: 'critical', resolved: false, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '2', site_id: '1', severity: 'major', resolved: true, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '3', site_id: '2', severity: 'minor', resolved: true, timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  private mockPPEViolations: PPEViolation[] = [
    { id: '1', user_id: '1', category: 'helmet', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), severity: 'major', resolved: false },
    { id: '2', user_id: '2', category: 'vest', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), severity: 'minor', resolved: true },
  ];

  private mockEntryLogs: SiteEntryLog[] = [
    { id: '1', user_id: '1', site_id: '1', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), entry_method: 'qr_scan', approved: false, rejection_reason: 'Late entry' },
    { id: '2', user_id: '2', site_id: '1', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), entry_method: 'qr_scan', approved: true },
  ];

  static getInstance(): SafetyAnalyticsService {
    if (!SafetyAnalyticsService.instance) {
      SafetyAnalyticsService.instance = new SafetyAnalyticsService();
    }
    return SafetyAnalyticsService.instance;
  }

  async calculateSafetyScore(siteId: string): Promise<SafetyScoreResult> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get incidents for the site in last 30 days
    const recentIncidents = this.mockIncidents.filter(incident => 
      incident.site_id === siteId && 
      new Date(incident.timestamp) >= thirtyDaysAgo
    );
    
    const unresolvedCritical = recentIncidents.filter(i => i.severity === 'critical' && !i.resolved).length;
    const unresolvedMajor = recentIncidents.filter(i => i.severity === 'major' && !i.resolved).length;
    const resolvedIncidents = recentIncidents.filter(i => i.resolved).length;
    
    // PPE compliance calculation
    const recentPPEViolations = this.mockPPEViolations.filter(v => 
      new Date(v.timestamp) >= thirtyDaysAgo
    );
    const ppeCompliance = Math.max(0, 100 - (recentPPEViolations.length * 10));
    
    // Entry violations
    const entryViolations = this.mockEntryLogs.filter(log => 
      log.site_id === siteId && 
      new Date(log.timestamp) >= thirtyDaysAgo && 
      !log.approved
    ).length;
    
    // Calculate base score
    let score = 100;
    score -= unresolvedCritical * 25; // Critical incidents heavily penalized
    score -= unresolvedMajor * 15;
    score -= entryViolations * 5;
    score -= (100 - ppeCompliance) * 0.3;
    
    score = Math.max(0, Math.min(100, score));
    
    // Determine color level and risk reason
    let colorLevel: 'green' | 'yellow' | 'red';
    let riskReason: string;
    
    if (score >= 80) {
      colorLevel = 'green';
      riskReason = 'Good safety performance';
    } else if (score >= 60) {
      colorLevel = 'yellow';
      riskReason = `Moderate risk: ${unresolvedCritical + unresolvedMajor} unresolved incidents`;
    } else {
      colorLevel = 'red';
      riskReason = `High risk: ${unresolvedCritical} critical incidents, ${entryViolations} entry violations`;
    }
    
    // Trigger notifications for score changes
    this.checkScoreNotifications(siteId, score, colorLevel, riskReason);
    
    return {
      score: Math.round(score),
      colorLevel,
      riskReason,
      incidentCount: recentIncidents.length,
      resolvedIncidents,
      ppeCompliance: Math.round(ppeCompliance),
      entryViolations
    };
  }

  private checkScoreNotifications(siteId: string, score: number, colorLevel: string, riskReason: string) {
    if (colorLevel === 'red') {
      this.notificationService.addNotification({
        id: `safety-alert-${siteId}-${Date.now()}`,
        title: `Safety Alert: Site #${siteId}`,
        message: `Safety score dropped to ${score} (🔴) - ${riskReason}`,
        type: 'alert',
        timestamp: new Date().toISOString(),
        read: false
      });
    }
    
    // PPE improvement notification
    if (score >= 85) {
      this.notificationService.addNotification({
        id: `ppe-improvement-${siteId}-${Date.now()}`,
        title: 'PPE Compliance Improved',
        message: `PPE compliance improved this week — ${score}% ✅`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });
    }
  }

  async getSiteIncidents(siteId: string) {
    return this.mockIncidents.filter(incident => incident.site_id === siteId);
  }

  async getPPEViolations(siteId: string) {
    return this.mockPPEViolations;
  }

  async getEntryLogs(siteId: string) {
    return this.mockEntryLogs.filter(log => log.site_id === siteId);
  }
}