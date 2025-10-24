export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'labor' | 'materials' | 'machinery' | 'progress' | 'chat' | 'general';
  read: boolean;
  createdAt: string;
  userId: string;
  priority?: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export class NotificationService {
  private static mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Labor Request Pending',
      message: '3 labor requests need your approval',
      type: 'labor',
      read: false,
      createdAt: '2024-01-21T10:30:00Z',
      userId: 'contractor1',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Material Delivery Scheduled',
      message: 'Concrete delivery scheduled for tomorrow 8 AM',
      type: 'materials',
      read: false,
      createdAt: '2024-01-21T09:15:00Z',
      userId: 'contractor1',
      priority: 'medium',
    },
  ];

  static async getNotifications(userId: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockNotifications.filter(notification => notification.userId === userId);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockNotifications.filter(
      notification => notification.userId === userId && !notification.read
    ).length;
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    this.mockNotifications
      .filter(n => n.userId === userId)
      .forEach(n => n.read = true);
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.mockNotifications.push(newNotification);
    return newNotification;
  }

  static async deleteNotification(notificationId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.mockNotifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;
    this.mockNotifications.splice(index, 1);
    return true;
  }

  static openSettings() {
    // Mock function to open notification settings
    console.log('Opening notification settings...');
  }

  static async sendWelcomeTrainingNotification(userId: string, userRole: string) {
    console.log(`Welcome notification sent to ${userId} (${userRole})`);
  }

  static async sendOnboardingCompletedNotification(userId: string, userRole: string) {
    console.log(`Onboarding completed notification sent to ${userId} (${userRole})`);
  }

  static async sendNotification(notification: any): Promise<void> {
    // Create notification using existing createNotification method
    await this.createNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type || 'general',
      read: false,
      userId: notification.user_id || notification.userId,
      priority: notification.priority || 'medium',
      actionUrl: notification.actionUrl
    });
  }
}

export default NotificationService;