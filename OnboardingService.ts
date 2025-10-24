import { OnboardingData, InviteLink, User } from '../types';
import { NotificationService } from './NotificationService';

export class OnboardingService {
  private static inviteLinks: InviteLink[] = [
    {
      id: '1',
      code: 'SITE5-CLIENT',
      created_by: 'admin1',
      site_id: 'site_5',
      role: 'client',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: '2',
      code: 'INVEST-MARIA',
      created_by: 'admin1',
      role: 'investor',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }
  ];

  static async validateInviteCode(code: string): Promise<InviteLink | null> {
    const invite = this.inviteLinks.find(inv => 
      inv.code === code && 
      inv.status === 'active' && 
      new Date(inv.expires_at) > new Date()
    );
    return invite || null;
  }

  static async validateProjectId(projectId: string): Promise<boolean> {
    // Mock validation - in real app, check against actual project/site IDs
    const validProjectIds = ['PROJ001', 'PROJ002', 'SITE001', 'SITE002'];
    return validProjectIds.includes(projectId);
  }

  static async createUser(data: OnboardingData): Promise<User> {
    // Validate invite code if provided
    if (data.invite_code) {
      const invite = await this.validateInviteCode(data.invite_code);
      if (!invite) {
        throw new Error('Invalid or expired invite code');
      }
      
      // Mark invite as used
      invite.status = 'used';
      invite.used_at = new Date().toISOString();
    }

    // Validate project ID if provided
    if (data.project_id) {
      const isValid = await this.validateProjectId(data.project_id);
      if (!isValid) {
        throw new Error('Invalid project ID');
      }
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      created_at: new Date().toISOString(),
      onboarding_completed: true,
      brand_theme: data.role === 'investor' && data.logo ? {
        primary_color: '#007AFF',
        logo_url: data.logo,
        powered_by_footer: true
      } : undefined
    };

    // Assign to site if invite code was used
    if (data.invite_code) {
      const invite = this.inviteLinks.find(inv => inv.code === data.invite_code);
      if (invite?.site_id) {
        newUser.assigned_sites = [invite.site_id];
      }
    }

    // Send notifications
    await this.sendOnboardingNotifications(newUser, data);

    return newUser;
  }

  static async createInviteLink(createdBy: string, role: 'client' | 'investor', siteId?: string): Promise<InviteLink> {
    const code = this.generateInviteCode(role, siteId);
    const invite: InviteLink = {
      id: `invite_${Date.now()}`,
      code,
      created_by: createdBy,
      site_id: siteId,
      role,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };

    this.inviteLinks.push(invite);
    return invite;
  }

  static generateInviteCode(role: 'client' | 'investor', siteId?: string): string {
    const prefix = role === 'client' ? 'CLIENT' : 'INVEST';
    const suffix = siteId ? siteId.toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${suffix}`;
  }

  static async getInviteLinks(createdBy: string): Promise<InviteLink[]> {
    return this.inviteLinks.filter(invite => invite.created_by === createdBy);
  }

  static async getPublicInviteUrl(code: string): Promise<string> {
    // In real app, this would be your domain
    return `https://constructionhub.app/invite/${code}`;
  }

  private static async sendOnboardingNotifications(user: User, data: OnboardingData): Promise<void> {
    if (user.role === 'client' && user.assigned_sites?.length) {
      const siteId = user.assigned_sites[0];
      await NotificationService.sendNotification({
        id: `onboard_${Date.now()}`,
        title: 'New Client User Created',
        message: `${user.name} has joined as a client for Site #${siteId}`,
        type: 'user_onboarded',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'medium'
      });
    }

    if (user.role === 'investor') {
      await NotificationService.sendNotification({
        id: `onboard_${Date.now()}`,
        title: 'New Investor Onboarded',
        message: `Investor ${user.name} has completed onboarding${data.invite_code ? ' via invite' : ''}`,
        type: 'investor_onboarded',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'medium'
      });
    }
  }

  static async toggleDemoMode(userId: string, isDemoMode: boolean): Promise<void> {
    // Mock implementation for demo user role toggle
    console.log(`Demo mode ${isDemoMode ? 'enabled' : 'disabled'} for user ${userId}`);
  }
}