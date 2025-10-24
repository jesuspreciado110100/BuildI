import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ProjectUpdate {
  id: string;
  project_id: string;
  type: 'progress' | 'status' | 'budget' | 'team' | 'milestone';
  title: string;
  message: string;
  data: any;
  created_at: string;
  user_id?: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  project_id?: string;
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  // Subscribe to project updates
  subscribeToProjects(callback: (payload: any) => void) {
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        callback
      )
      .subscribe();

    this.channels.set('projects', channel);
    return channel;
  }

  // Subscribe to project updates/notifications
  subscribeToProjectUpdates(projectId: string, callback: (update: ProjectUpdate) => void) {
    const channelName = `project-updates-${projectId}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'project_updates',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => callback(payload.new as ProjectUpdate)
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to user notifications
  subscribeToNotifications(userId: string, callback: (notification: NotificationData) => void) {
    const channelName = `notifications-${userId}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => callback(payload.new as NotificationData)
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Unsubscribe from a channel
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }

  // Send project update
  async sendProjectUpdate(update: Omit<ProjectUpdate, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('project_updates')
      .insert([update])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Send notification
  async sendNotification(notification: Omit<NotificationData, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }
}

export const realtimeService = new RealtimeService();
export default RealtimeService;