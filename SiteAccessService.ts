import { User, SiteEntryLog, PPEViolation, SiteAccess } from '../types';
import { NotificationService } from './NotificationService';

export class SiteAccessService {
  private static mockUsers: User[] = [
    {
      id: '1',
      name: 'Juan Rodriguez',
      email: 'juan@example.com',
      role: 'worker',
      created_at: '2024-01-01',
      qr_code_url: 'QR123456',
      ppe_required_by_role: ['helmet', 'vest', 'glasses']
    },
    {
      id: '2',
      name: 'Jose Martinez',
      email: 'jose@example.com',
      role: 'labor_chief',
      created_at: '2024-01-01',
      qr_code_url: 'QR789012',
      ppe_required_by_role: ['helmet', 'vest']
    }
  ];

  private static entryLogs: SiteEntryLog[] = [];
  private static ppeViolations: PPEViolation[] = [];

  static async generateEntryQR(userId: string): Promise<string> {
    const qrCode = `QR${userId}${Date.now()}`;
    const user = this.mockUsers.find(u => u.id === userId);
    if (user) {
      user.qr_code_url = qrCode;
    }
    return qrCode;
  }

  static async logEntry(
    userId: string,
    siteId: string,
    timestamp: string,
    photoUrl?: string
  ): Promise<SiteEntryLog> {
    const user = this.mockUsers.find(u => u.id === userId);
    const approved = user ? this.validateUserAccess(user, siteId) : false;
    
    const entry: SiteEntryLog = {
      id: `entry_${Date.now()}`,
      user_id: userId,
      site_id: siteId,
      timestamp,
      photo_url: photoUrl,
      entry_method: 'qr_scan',
      approved,
      rejection_reason: approved ? undefined : 'Invalid role for site access'
    };

    this.entryLogs.push(entry);
    
    if (user) {
      if (!user.site_entry_logs) user.site_entry_logs = [];
      user.site_entry_logs.push(entry);
    }

    // Send notification
    if (approved && user) {
      NotificationService.sendNotification({
        id: `notif_${Date.now()}`,
        user_id: 'admin',
        title: 'Site Entry Logged',
        message: `${user.name} entered Site #${siteId} at ${new Date(timestamp).toLocaleTimeString()}`,
        type: 'site_entry',
        status: 'unread',
        timestamp: new Date().toISOString()
      });
    }

    return entry;
  }

  static async logPPEViolation(
    userId: string,
    category: 'helmet' | 'vest' | 'glasses' | 'gloves' | 'boots',
    timestamp: string,
    photoUrl?: string
  ): Promise<PPEViolation> {
    const user = this.mockUsers.find(u => u.id === userId);
    
    const violation: PPEViolation = {
      id: `ppe_${Date.now()}`,
      user_id: userId,
      category,
      timestamp,
      photo_url: photoUrl,
      severity: 'major',
      resolved: false,
      notes: `Missing ${category} detected by AI scan`
    };

    this.ppeViolations.push(violation);
    
    if (user) {
      if (!user.ppe_violations) user.ppe_violations = [];
      user.ppe_violations.push(violation);
    }

    // Send notification
    if (user) {
      NotificationService.sendNotification({
        id: `notif_${Date.now()}`,
        user_id: 'admin',
        title: 'PPE Violation Detected',
        message: `${category.toUpperCase()} violation detected for ${user.name} (${user.role})`,
        type: 'ppe_violation',
        status: 'unread',
        timestamp: new Date().toISOString()
      });
    }

    return violation;
  }

  static async getUserByQR(qrCode: string): Promise<User | null> {
    return this.mockUsers.find(u => u.qr_code_url === qrCode) || null;
  }

  static async getSiteEntries(siteId: string): Promise<SiteEntryLog[]> {
    return this.entryLogs.filter(log => log.site_id === siteId);
  }

  static async getPPEViolations(siteId?: string): Promise<PPEViolation[]> {
    return this.ppeViolations;
  }

  private static validateUserAccess(user: User, siteId: string): boolean {
    // Mock validation - in real app would check site permissions
    const allowedRoles = ['worker', 'labor_chief', 'contractor', 'admin'];
    return allowedRoles.includes(user.role);
  }
}