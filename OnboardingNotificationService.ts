import { NotificationService } from './NotificationService';
import { User, InviteLink } from '../types';

export class OnboardingNotificationService {
  static async sendNewClientNotification(user: User, siteId: string): Promise<void> {
    await NotificationService.sendNotification({
      id: `client_onboard_${Date.now()}`,
      title: 'New Client User Created',
      message: `${user.name} has joined as a client for Site #${siteId}`,
      type: 'user_onboarded',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium',
      data: {
        userId: user.id,
        siteId,
        role: 'client'
      }
    });
  }

  static async sendNewInvestorNotification(user: User, viaInvite: boolean = false): Promise<void> {
    await NotificationService.sendNotification({
      id: `investor_onboard_${Date.now()}`,
      title: 'New Investor Onboarded',
      message: `Investor ${user.name} has completed onboarding${viaInvite ? ' via invite' : ''}`,
      type: 'investor_onboarded',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium',
      data: {
        userId: user.id,
        role: 'investor',
        viaInvite
      }
    });
  }

  static async sendInviteLinkCreatedNotification(invite: InviteLink, createdBy: string): Promise<void> {
    await NotificationService.sendNotification({
      id: `invite_created_${Date.now()}`,
      title: 'Invite Link Created',
      message: `New ${invite.role} invite link created${invite.site_id ? ` for Site #${invite.site_id}` : ''}`,
      type: 'invite_created',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'low',
      data: {
        inviteId: invite.id,
        inviteCode: invite.code,
        role: invite.role,
        siteId: invite.site_id,
        createdBy
      }
    });
  }

  static async sendInviteLinkUsedNotification(invite: InviteLink, user: User): Promise<void> {
    await NotificationService.sendNotification({
      id: `invite_used_${Date.now()}`,
      title: 'Invite Link Used',
      message: `${user.name} joined using invite code ${invite.code}`,
      type: 'invite_used',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium',
      data: {
        inviteId: invite.id,
        inviteCode: invite.code,
        userId: user.id,
        userName: user.name,
        role: user.role
      }
    });
  }

  static async sendOnboardingCompletedNotification(user: User): Promise<void> {
    await NotificationService.sendNotification({
      id: `onboarding_complete_${Date.now()}`,
      title: 'Onboarding Completed',
      message: `${user.name} has completed the onboarding process as ${user.role}`,
      type: 'onboarding_completed',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'low',
      data: {
        userId: user.id,
        userName: user.name,
        role: user.role
      }
    });
  }

  static async sendDemoModeToggleNotification(userId: string, isDemoMode: boolean): Promise<void> {
    await NotificationService.sendNotification({
      id: `demo_mode_${Date.now()}`,
      title: 'Demo Mode Toggle',
      message: `Demo mode ${isDemoMode ? 'enabled' : 'disabled'} for investor walk-through`,
      type: 'demo_mode_toggle',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'low',
      data: {
        userId,
        isDemoMode
      }
    });
  }

  static async sendBrandingUpdatedNotification(userId: string, changes: string[]): Promise<void> {
    await NotificationService.sendNotification({
      id: `branding_updated_${Date.now()}`,
      title: 'Branding Settings Updated',
      message: `Brand settings updated: ${changes.join(', ')}`,
      type: 'branding_updated',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'low',
      data: {
        userId,
        changes
      }
    });
  }
}