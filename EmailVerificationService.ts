import { supabase } from '../lib/supabase';

export class EmailVerificationService {
  static async sendVerificationEmail(userId: string, email: string, userName?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: { userId, email, userName: userName || 'User' }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Send verification error:', error);
      throw new Error(error.message || 'Failed to send verification email');
    }
  }

  static async checkThrottling(userId: string): Promise<{ canSend: boolean; waitTime?: number }> {
    try {
      const { data } = await supabase
        .from('email_verification_attempts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!data) return { canSend: true };

      const timeSince = Date.now() - new Date(data.last_attempt_at).getTime();
      const cooldown = 60000; // 1 minute

      if (timeSince < cooldown && data.attempt_count >= 3) {
        return { canSend: false, waitTime: Math.ceil((cooldown - timeSince) / 1000) };
      }

      return { canSend: true };
    } catch (error) {
      return { canSend: true };
    }
  }

  static async verifyToken(token: string) {
    try {
      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: { token }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Verification failed');
    }
  }
}
