import { User, ReferralStats, ReferralHistoryItem } from '../types';

export class ReferralService {
  private static instance: ReferralService;
  private referralData: Map<string, ReferralStats> = new Map();

  static getInstance(): ReferralService {
    if (!ReferralService.instance) {
      ReferralService.instance = new ReferralService();
    }
    return ReferralService.instance;
  }

  async generateReferralLink(userId: string): Promise<string> {
    const referralCode = this.generateReferralCode(userId);
    const baseUrl = 'https://constructionops.app';
    return `${baseUrl}/signup?ref=${referralCode}`;
  }

  private generateReferralCode(userId: string): string {
    return `REF${userId.substring(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  async trackSignupViaReferral(referralCode: string, newUserId: string, newUserRole: string): Promise<void> {
    const referrerId = this.extractUserIdFromCode(referralCode);
    if (!referrerId) return;

    const stats = this.referralData.get(referrerId) || this.createEmptyStats();
    
    const newReferral: ReferralHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      referred_user_name: `User ${newUserId}`,
      referred_user_role: newUserRole,
      signup_date: new Date().toISOString(),
      status: 'pending'
    };

    stats.total_referrals++;
    stats.pending_referrals++;
    stats.referral_history.push(newReferral);
    
    this.referralData.set(referrerId, stats);
  }

  async getReferralStats(userId: string): Promise<ReferralStats> {
    if (!this.referralData.has(userId)) {
      this.referralData.set(userId, this.createMockStats(userId));
    }
    return this.referralData.get(userId)!;
  }

  async applyRewardOnAction(userId: string, actionType: 'first_booking' | 'first_completion'): Promise<void> {
    // Find who referred this user and apply reward
    const referrerId = this.findReferrerForUser(userId);
    if (!referrerId) return;

    const stats = this.referralData.get(referrerId);
    if (!stats) return;

    const referralItem = stats.referral_history.find(r => r.referred_user_name.includes(userId));
    if (referralItem && referralItem.status === 'pending') {
      referralItem.status = actionType === 'first_completion' ? 'completed_first_action' : 'active';
      referralItem.reward_earned = actionType === 'first_completion' ? 25 : 10;
      
      stats.successful_referrals++;
      stats.pending_referrals--;
      stats.total_credits_earned += referralItem.reward_earned;
    }
  }

  private extractUserIdFromCode(code: string): string | null {
    if (code.startsWith('REF')) {
      return code.substring(3, 7).toLowerCase();
    }
    return null;
  }

  private findReferrerForUser(userId: string): string | null {
    for (const [referrerId, stats] of this.referralData.entries()) {
      if (stats.referral_history.some(r => r.referred_user_name.includes(userId))) {
        return referrerId;
      }
    }
    return null;
  }

  private createEmptyStats(): ReferralStats {
    return {
      total_referrals: 0,
      successful_referrals: 0,
      pending_referrals: 0,
      total_credits_earned: 0,
      referral_history: []
    };
  }

  private createMockStats(userId: string): ReferralStats {
    return {
      total_referrals: 3,
      successful_referrals: 2,
      pending_referrals: 1,
      total_credits_earned: 50,
      referral_history: [
        {
          id: '1',
          referred_user_name: 'Maria Rodriguez',
          referred_user_role: 'contractor',
          signup_date: '2024-01-15T10:00:00Z',
          status: 'completed_first_action',
          reward_earned: 25
        },
        {
          id: '2',
          referred_user_name: 'John Smith',
          referred_user_role: 'labor_chief',
          signup_date: '2024-01-20T14:30:00Z',
          status: 'active',
          reward_earned: 25
        },
        {
          id: '3',
          referred_user_name: 'Sarah Johnson',
          referred_user_role: 'machinery_renter',
          signup_date: '2024-01-25T09:15:00Z',
          status: 'pending'
        }
      ]
    };
  }
}

export const referralService = ReferralService.getInstance();