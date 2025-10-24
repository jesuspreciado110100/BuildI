import { SafetyIncident } from '../types';
import { NotificationService } from './NotificationService';

class SafetyLogServiceClass {
  private incidents: SafetyIncident[] = [];
  private nextId = 1;

  async createIncident(incident: Omit<SafetyIncident, 'id'>): Promise<SafetyIncident> {
    const newIncident: SafetyIncident = {
      ...incident,
      id: this.nextId.toString(),
    };
    this.nextId++;
    this.incidents.push(newIncident);

    // Send notification
    await NotificationService.sendNotification({
      user_id: incident.reporter_id,
      title: 'Safety Incident Reported',
      message: `New Safety Incident: ${incident.category} (Severity: ${incident.severity})`,
      type: 'safety_incident',
      related_id: newIncident.id,
      related_type: 'safety_incident'
    });

    return newIncident;
  }

  async getSiteIncidents(siteId: string): Promise<SafetyIncident[]> {
    return this.incidents.filter(incident => incident.site_id === siteId);
  }

  async markResolved(incidentId: string, resolutionNotes: string): Promise<SafetyIncident | null> {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (!incident) return null;

    incident.resolution_status = 'resolved';
    incident.resolution_notes = resolutionNotes;

    // Send resolution notification
    await NotificationService.sendNotification({
      user_id: incident.reporter_id,
      title: 'Safety Incident Resolved',
      message: `Incident #${incidentId} resolved: ${incident.category} contained`,
      type: 'safety_resolved',
      related_id: incidentId,
      related_type: 'safety_incident'
    });

    return incident;
  }

  // Mock AI IoT trigger
  async simulateIoTEvent(sensorType: string, siteId: string): Promise<SafetyIncident | null> {
    if (sensorType === 'fall_detected') {
      const incident = await this.createIncident({
        site_id: siteId,
        reporter_id: 'iot_system',
        severity: 'critical',
        category: 'fall',
        timestamp: new Date().toISOString(),
        resolution_status: 'open',
        description: 'Fall detected by IoT sensor',
        iot_triggered: true
      });
      return incident;
    }
    return null;
  }

  getSafetyScore(siteId: string): number {
    const siteIncidents = this.incidents.filter(i => i.site_id === siteId);
    if (siteIncidents.length === 0) return 100;
    
    const unresolvedCritical = siteIncidents.filter(
      i => i.resolution_status !== 'resolved' && i.severity === 'critical'
    ).length;
    
    return Math.max(0, (1 - unresolvedCritical / siteIncidents.length) * 100);
  }
}

export const SafetyLogService = new SafetyLogServiceClass();